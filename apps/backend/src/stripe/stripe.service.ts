import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secret) {
      this.stripe = new Stripe(secret);
      console.log('Stripe initialization: Stripe Secret Key found and initialized.');
    } else {
      console.warn('Stripe initialization warning: STRIPE_SECRET_KEY not found in configuration!');
    }
  }

  private ensureStripe(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Set STRIPE_SECRET_KEY in .env');
    }
    return this.stripe;
  }

  /** Create Stripe Connect account link for freelancer onboarding */
  async createConnectAccountLink(userId: string, returnUrl: string, refreshUrl: string) {
    const stripe = this.ensureStripe();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'FREELANCER') {
      throw new BadRequestException('Only freelancers can connect Stripe accounts');
    }

    const profile = user.profile;
    let accountId = profile?.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      });
      accountId = account.id;
      await this.prisma.profile.update({
        where: { userId },
        data: { stripeAccountId: accountId },
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return { url: link.url };
  }

  /** Get Connect account status (charges_enabled = fully onboarded) */
  async getConnectStatus(userId: string) {
    const stripe = this.ensureStripe();
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { stripeAccountId: true },
    });
    if (!profile?.stripeAccountId) {
      return { connected: false };
    }
    const account = await stripe.accounts.retrieve(profile.stripeAccountId);
    return {
      connected: true,
      chargesEnabled: account.charges_enabled ?? false,
    };
  }

  /** Create PaymentIntent for milestone funding (escrow: capture_method manual) */
  async createMilestonePaymentIntent(milestoneId: string, clientId: string) {
    const stripe = this.ensureStripe();
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          include: {
            freelancer: { include: { profile: true } },
            project: true,
          },
        },
      },
    });

    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.contract.clientId !== clientId) {
      throw new BadRequestException('Only the client can fund this milestone');
    }
    if (milestone.status !== 'PENDING' && milestone.status !== 'IN_PROGRESS' && milestone.status !== 'COMPLETED') {
      throw new BadRequestException('Milestone is not in a payable state');
    }
    if (milestone.stripePaymentIntentId) {
      const existing = await stripe.paymentIntents.retrieve(milestone.stripePaymentIntentId);
      if (
        existing.status === 'requires_payment_method' ||
        existing.status === 'requires_confirmation' ||
        existing.status === 'requires_action' ||
        existing.status === 'requires_capture'
      ) {
        return { clientSecret: existing.client_secret };
      }
      if (existing.status === 'succeeded') {
        throw new BadRequestException('Milestone is already paid');
      }
    }

    const stripeAccountId = milestone.contract.freelancer.profile?.stripeAccountId;
    if (!stripeAccountId) {
      throw new BadRequestException('Freelancer must complete Stripe Connect onboarding first');
    }

    const settings = await this.getPlatformSettings();
    const freelancerFeePercent = settings.freelancerServiceFee / 100;
    const clientFeePercent = settings.clientProcessingFee / 100;

    const milestoneAmount = milestone.amount; // in cents
    const clientFee = Math.round(milestoneAmount * clientFeePercent);
    const freelancerFee = Math.round(milestoneAmount * freelancerFeePercent);

    const totalAmountCharged = milestoneAmount + clientFee;
    const platformTotalCut = clientFee + freelancerFee;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCharged,
      currency: 'usd',
      capture_method: 'manual',
      automatic_payment_methods: { enabled: true },
      metadata: {
        milestoneId,
        contractId: milestone.contractId,
        projectTitle: milestone.contract.project.title,
        baseAmount: milestoneAmount.toString(),
        clientFee: clientFee.toString(),
        freelancerFee: freelancerFee.toString(),
      },
      transfer_data: {
        destination: stripeAccountId,
      },
      application_fee_amount: platformTotalCut,
    });

    await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        isFunded: false,
        clientFee,
        freelancerFee,
      },
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  /** Capture PaymentIntent when client approves milestone */
  async captureMilestonePayment(milestoneId: string, clientId: string) {
    const stripe = this.ensureStripe();
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { contract: true },
    });

    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.contract.clientId !== clientId) {
      throw new BadRequestException('Only the client can release payment');
    }
    if (milestone.status !== 'COMPLETED') {
      throw new BadRequestException('Milestone must be marked completed before approval');
    }
    if (!milestone.isFunded) {
      if (!milestone.stripePaymentIntentId) {
        throw new BadRequestException('Milestone has no payment to release');
      }
      const pi = await stripe.paymentIntents.retrieve(milestone.stripePaymentIntentId);
      if (pi.status === 'requires_capture' || pi.status === 'succeeded') {
        // Automatically sync if we find it's actually funded
        await this.prisma.milestone.update({
          where: { id: milestoneId },
          data: { isFunded: true },
        });
      } else {
        throw new BadRequestException(`Milestone is not funded. Current payment status: ${pi.status}`);
      }
    }

    if (!milestone.stripePaymentIntentId) {
      throw new BadRequestException('Milestone has no payment to release');
    }
    const pi = await stripe.paymentIntents.retrieve(milestone.stripePaymentIntentId);
    if (pi.status === 'succeeded') {
      await this.prisma.milestone.update({
        where: { id: milestoneId },
        data: { status: 'PAID' },
      });
      return { released: true };
    }
    if (pi.status !== 'requires_capture') {
      throw new BadRequestException(`Payment is not ready to capture: ${pi.status}`);
    }

    if (!milestone.stripePaymentIntentId) {
      throw new BadRequestException('Milestone has no payment to release');
    }

    console.log(`[Stripe] Capturing payment intent ${milestone.stripePaymentIntentId} for milestone ${milestoneId}`);
    const captureResult = await stripe.paymentIntents.capture(milestone.stripePaymentIntentId);
    console.log(`[Stripe] Capture successful for ${milestoneId}: status=${captureResult.status}`);

    await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'PAID' },
    });

    return { released: true };
  }

  /** Sync payment status from Stripe */
  async syncMilestonePaymentStatus(milestoneId: string) {
    const stripe = this.ensureStripe();
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone || !milestone.stripePaymentIntentId) return { isFunded: false };

    const pi = await stripe.paymentIntents.retrieve(milestone.stripePaymentIntentId);
    const isFunded = pi.status === 'requires_capture' || pi.status === 'succeeded';

    if (isFunded !== milestone.isFunded) {
      await this.prisma.milestone.update({
        where: { id: milestoneId },
        data: { isFunded },
      });
    }

    return { isFunded, stripeStatus: pi.status };
  }

  /** Get total earnings and payment history for a freelancer */
  async getEarningsStats(userId: string) {
    const paidMilestones = await this.prisma.milestone.findMany({
      where: {
        contract: {
          freelancerId: userId,
        },
        status: 'PAID',
      },
      include: {
        contract: {
          include: {
            project: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const totalCents = paidMilestones.reduce((sum, m) => sum + (m.amount - (m.freelancerFee || 0)), 0);
    const history = paidMilestones.map((m) => ({
      id: m.id,
      amount: (m.amount - (m.freelancerFee || 0)) / 100, // Convert net cents to dollars
      projectTitle: m.contract.project.title,
      date: m.updatedAt,
    }));

    return {
      totalEarnings: totalCents / 100,
      paymentHistory: history,
    };
  }

  private async getPlatformSettings() {
    return this.prisma.platformSettings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton' },
    });
  }
}

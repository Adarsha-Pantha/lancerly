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
    if (milestone.status !== 'PENDING') {
      throw new BadRequestException('Milestone is not pending funding');
    }
    if (milestone.stripePaymentIntentId) {
      const existing = await stripe.paymentIntents.retrieve(milestone.stripePaymentIntentId);
      if (existing.status === 'requires_capture') {
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

    const amountCents = Math.round(milestone.amount * 100);
    if (amountCents < 50) {
      throw new BadRequestException('Minimum amount is $0.50');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      capture_method: 'manual',
      automatic_payment_methods: { enabled: true },
      metadata: {
        milestoneId,
        contractId: milestone.contractId,
        projectTitle: milestone.contract.project.title,
      },
      transfer_data: {
        destination: stripeAccountId,
      },
      application_fee_amount: Math.round(amountCents * 0.1),
    });

    await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { stripePaymentIntentId: paymentIntent.id },
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

    await stripe.paymentIntents.capture(milestone.stripePaymentIntentId);
    await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'PAID' },
    });

    return { released: true };
  }
}

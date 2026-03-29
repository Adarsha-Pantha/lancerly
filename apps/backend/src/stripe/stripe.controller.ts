import { Controller, Post, Get, Param, Body, Req, Headers, BadRequestException, RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {
    console.log('StripeController initialized - Version 2 (with earnings)');
  }

  private getUserId(req: Request): string {
    const user = (req as Request & { user?: { userId: string } }).user;
    if (!user?.userId) throw new Error('User not found in request');
    return user.userId;
  }

  @UseGuards(JwtAuthGuard)
  @Post('connect/onboarding-link')
  async createOnboardingLink(@Req() req: Request, @Body() body: { returnUrl?: string; refreshUrl?: string }) {
    const userId = this.getUserId(req);
    return this.stripeService.createConnectAccountLink(
      userId,
      body.returnUrl ?? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings`,
      body.refreshUrl ?? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('connect/status')
  async getConnectStatus(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.stripeService.getConnectStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('milestones/:milestoneId/fund')
  async fundMilestone(@Req() req: Request, @Param('milestoneId') milestoneId: string) {
    const clientId = this.getUserId(req);
    return this.stripeService.createMilestonePaymentIntent(milestoneId, clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('milestones/:milestoneId/payment-intent')
  async createPaymentIntent(@Req() req: Request, @Param('milestoneId') milestoneId: string) {
    const clientId = this.getUserId(req);
    return this.stripeService.createMilestonePaymentIntent(milestoneId, clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('milestones/:milestoneId/capture')
  async captureMilestone(@Req() req: Request, @Param('milestoneId') milestoneId: string) {
    const clientId = this.getUserId(req);
    return this.stripeService.captureMilestonePayment(milestoneId, clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('earnings')
  async getEarnings(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.stripeService.getEarningsStats(userId);
  }

  @Post('milestones/:id/sync')
  async syncPayment(@Param('id') id: string) {
    return this.stripeService.syncMilestonePaymentStatus(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Req() req: Request, @Body() body: { subscribe?: boolean }) {
    const userId = this.getUserId(req);
    return this.stripeService.subscribeUser(userId, body.subscribe ?? true);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-subscription')
  async syncSubscription(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.stripeService.syncSubscriptionStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-subscription-session')
  async createSubscription(
    @Req() req: Request,
    @Body() body: { successUrl?: string; cancelUrl?: string }
  ) {
    const userId = this.getUserId(req);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return this.stripeService.createSubscriptionSession(
      userId,
      body.successUrl ?? `${frontendUrl}/settings?tab=subscription&success=true`,
      body.cancelUrl ?? `${frontendUrl}/settings?tab=subscription&canceled=true`
    );
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Headers('stripe-signature') signature: string) {
    // Note: If you want to verify signatures, you need to enable rawBody in main.ts
    // For now, we decode the event and process it.
    const body = (req as any).body;
    const eventType = body?.type;
    const data = body?.data?.object;

    console.log(`[Stripe Webhook] Received ${eventType}. Metadata:`, JSON.stringify(data.metadata));

    if (eventType === 'checkout.session.completed') {
      const userId = data.metadata?.userId;
      const subscriptionId = data.subscription;
      if (userId && subscriptionId) {
        await this.stripeService.handleSubscriptionSucceeded(userId, subscriptionId as string);
        console.log(`[Stripe Webhook] Subscription ${subscriptionId} activated for user ${userId}`);
      }
    } else if (eventType === 'customer.subscription.deleted') {
      const userId = data.metadata?.userId;
      if (userId) {
        await this.stripeService.handleSubscriptionDeleted(userId);
        console.log(`[Stripe Webhook] Subscription canceled for user ${userId}`);
      }
    }

    return { received: true };
  }
}

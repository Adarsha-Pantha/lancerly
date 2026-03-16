import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
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
}

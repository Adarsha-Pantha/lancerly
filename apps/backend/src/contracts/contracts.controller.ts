import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { ContractsService } from './contracts.service';
import { DeliveriesService } from './deliveries.service';
import { TimeTrackingService } from './time-tracking.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateContractTermsDto } from './dto/update-contract-terms.dto';

@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly deliveriesService: DeliveriesService,
    private readonly timeTrackingService: TimeTrackingService,
  ) {}

  private async getUserId(req: Request): Promise<string> {
    return this.contractsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
  }

  /** Get contract stats for dashboard - use /stats to avoid route conflict with :contractId */
  @Get('stats')
  async getMyStats(@Req() req: Request, @Query('role') role?: 'CLIENT' | 'FREELANCER') {
    const userId = await this.getUserId(req);
    if (!role) {
      const user = await this.contractsService.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      role = user?.role === 'CLIENT' ? 'CLIENT' : 'FREELANCER';
    }
    return this.contractsService.getStats(userId, role);
  }

  /** Get transaction history */
  @Get('transactions')
  async getTransactions(@Req() req: Request, @Query('role') role?: 'CLIENT' | 'FREELANCER') {
    const userId = await this.getUserId(req);
    if (!role) {
      const user = await this.contractsService.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      role = user?.role === 'CLIENT' ? 'CLIENT' : 'FREELANCER';
    }
    return this.contractsService.getTransactions(userId, role as 'CLIENT' | 'FREELANCER');
  }

  /** Get contracts for current user */
  @Get('me')
  async getMyContracts(@Req() req: Request, @Query('role') role?: 'CLIENT' | 'FREELANCER') {
    const userId = await this.getUserId(req);
    
    // Determine role from user if not provided
    if (!role) {
      const user = await this.contractsService.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      role = user?.role === 'CLIENT' ? 'CLIENT' : 'FREELANCER';
    }

    return this.contractsService.findByUser(userId, role);
  }

  /** Get contract by project ID */
  @Get('project/:projectId')
  async getByProject(@Req() req: Request, @Param('projectId') projectId: string) {
    const userId = await this.getUserId(req);
    return this.contractsService.findByProject(projectId, userId);
  }

  /** Get contract by contract ID (for /contracts/:id) - must be after me, project/:projectId, time/me, deliveries/:id */
  @Get(':contractId')
  async getById(@Req() req: Request, @Param('contractId') contractId: string) {
    const userId = await this.getUserId(req);
    return this.contractsService.findById(contractId, userId);
  }

  /** Create a milestone */
  @Post(':contractId/milestones')
  async createMilestone(
    @Req() req: Request,
    @Param('contractId') contractId: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    const clientId = await this.getUserId(req);
    return this.contractsService.createMilestone(contractId, clientId, dto);
  }

  /** Get milestones for a contract */
  @Get(':contractId/milestones')
  async getMilestones(@Req() req: Request, @Param('contractId') contractId: string) {
    const userId = await this.getUserId(req);
    return this.contractsService.getMilestones(contractId, userId);
  }

  /** Approve a milestone */
  @Patch('milestones/:milestoneId/approve')
  async approveMilestone(@Req() req: Request, @Param('milestoneId') milestoneId: string) {
    const clientId = await this.getUserId(req);
    return this.contractsService.approveMilestone(milestoneId, clientId);
  }

  /** Mark milestone as completed */
  @Patch('milestones/:milestoneId/complete')
  async completeMilestone(@Req() req: Request, @Param('milestoneId') milestoneId: string) {
    const freelancerId = await this.getUserId(req);
    return this.contractsService.completeMilestone(milestoneId, freelancerId);
  }

  /** Terminate contract */
  @Patch(':contractId/terminate')
  async terminateContract(
    @Req() req: Request,
    @Param('contractId') contractId: string,
    @Body('reason') reason?: string,
  ) {
    const userId = await this.getUserId(req);
    return this.contractsService.terminateContract(contractId, userId, reason);
  }

  /** Complete contract (client only, when all milestones paid) */
  @Patch(':contractId/complete')
  async completeContract(@Req() req: Request, @Param('contractId') contractId: string) {
    const userId = await this.getUserId(req);
    return this.contractsService.completeContract(contractId, userId);
  }

  /** Update contract terms */
  @Patch(':contractId/terms')
  async updateTerms(
    @Req() req: Request,
    @Param('contractId') contractId: string,
    @Body() dto: UpdateContractTermsDto,
  ) {
    const userId = await this.getUserId(req);
    return this.contractsService.updateTerms(contractId, userId, dto.terms ?? '');
  }

  /** Submit a delivery */
  @Post(':contractId/deliveries')
  async createDelivery(
    @Req() req: Request,
    @Param('contractId') contractId: string,
    @Body() dto: CreateDeliveryDto,
  ) {
    const freelancerId = await this.getUserId(req);
    return this.deliveriesService.create(contractId, freelancerId, dto);
  }

  /** Get deliveries for a contract */
  @Get(':contractId/deliveries')
  async getDeliveries(@Req() req: Request, @Param('contractId') contractId: string) {
    const userId = await this.getUserId(req);
    return this.deliveriesService.findByContract(contractId, userId);
  }

  /** Approve a delivery */
  @Patch('deliveries/:deliveryId/approve')
  async approveDelivery(@Req() req: Request, @Param('deliveryId') deliveryId: string) {
    const clientId = await this.getUserId(req);
    return this.deliveriesService.approve(deliveryId, clientId);
  }

  /** Reject a delivery */
  @Patch('deliveries/:deliveryId/reject')
  async rejectDelivery(
    @Req() req: Request,
    @Param('deliveryId') deliveryId: string,
    @Body('feedback') feedback?: string,
  ) {
    const clientId = await this.getUserId(req);
    return this.deliveriesService.reject(deliveryId, clientId, feedback);
  }

  /** Request revision */
  @Patch('deliveries/:deliveryId/revision')
  async requestRevision(
    @Req() req: Request,
    @Param('deliveryId') deliveryId: string,
    @Body('feedback') feedback: string,
  ) {
    const clientId = await this.getUserId(req);
    return this.deliveriesService.requestRevision(deliveryId, clientId, feedback);
  }

  /** Get a single delivery */
  @Get('deliveries/:deliveryId')
  async getDelivery(@Req() req: Request, @Param('deliveryId') deliveryId: string) {
    const userId = await this.getUserId(req);
    return this.deliveriesService.findOne(deliveryId, userId);
  }

  /** Start time tracking */
  @Post(':contractId/time/start')
  async startTimer(
    @Req() req: Request,
    @Param('contractId') contractId: string,
    @Body('description') description?: string,
  ) {
    const freelancerId = await this.getUserId(req);
    return this.timeTrackingService.startTimer(contractId, freelancerId, description);
  }

  /** Stop time tracking */
  @Patch('time/:timeEntryId/stop')
  async stopTimer(@Req() req: Request, @Param('timeEntryId') timeEntryId: string) {
    const freelancerId = await this.getUserId(req);
    return this.timeTrackingService.stopTimer(timeEntryId, freelancerId);
  }

  /** Get time entries for a contract */
  @Get(':contractId/time')
  async getTimeEntries(@Req() req: Request, @Param('contractId') contractId: string) {
    const userId = await this.getUserId(req);
    return this.timeTrackingService.findByContract(contractId, userId);
  }

  /** Get running timer */
  @Get(':contractId/time/running')
  async getRunningTimer(@Req() req: Request, @Param('contractId') contractId: string) {
    const freelancerId = await this.getUserId(req);
    return this.timeTrackingService.getRunningTimer(contractId, freelancerId);
  }

  /** Get all time entries for freelancer */
  @Get('time/me')
  async getMyTimeEntries(@Req() req: Request) {
    const freelancerId = await this.getUserId(req);
    return this.timeTrackingService.findByFreelancer(freelancerId);
  }
}


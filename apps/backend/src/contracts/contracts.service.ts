import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';

@Injectable()
export class ContractsService {
  constructor(
    public readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly stripeService: StripeService,
  ) {}

  async userIdFromAuth(auth?: string) {
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.slice(7);
    const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');
    return payload.sub;
  }

  /** Get contract by contract ID */
  async findById(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
                stripeAccountId: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        milestones: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            deliveries: true,
            timeEntries: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return contract;
  }

  /** Get contract by project ID */
  async findByProject(projectId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { projectId },
      include: {
        project: {
          select: {
            title: true,
            description: true,
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
                stripeAccountId: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        milestones: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            deliveries: true,
            timeEntries: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Check access: client or freelancer
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return contract;
  }

  /** Get contracts for a user */
  async findByUser(userId: string, role: 'CLIENT' | 'FREELANCER') {
    const where = role === 'CLIENT' 
      ? { clientId: userId }
      : { freelancerId: userId };

    const contracts = await this.prisma.contract.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            milestones: true,
            deliveries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contracts;
  }

  /** Create a milestone (client action) */
  async createMilestone(contractId: string, clientId: string, dto: CreateMilestoneDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.clientId !== clientId) {
      throw new ForbiddenException('Only the client can create milestones');
    }

    if (contract.status !== 'ACTIVE') {
      throw new BadRequestException('Contract is not active');
    }

    const milestone = await this.prisma.milestone.create({
      data: {
        contractId,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: 'PENDING',
      },
    });

    // Notify freelancer
    await this.notificationsService.createNotification(
      contract.freelancerId,
      'NEW_MILESTONE',
      `A new milestone "${dto.title}" has been added to your contract`,
      {
        contractId,
        milestoneId: milestone.id,
      },
    );

    return milestone;
  }

  /** Approve a milestone (client action). If Stripe-funded, captures payment first. */
  async approveMilestone(milestoneId: string, clientId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: true,
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.contract.clientId !== clientId) {
      throw new ForbiddenException('Only the client can approve milestones');
    }

    if (milestone.status !== 'COMPLETED') {
      throw new BadRequestException('Milestone must be completed before approval');
    }

    // If Stripe-funded, capture payment first
    if (milestone.stripePaymentIntentId) {
      try {
        await this.stripeService.captureMilestonePayment(milestoneId, clientId);
        const paid = await this.prisma.milestone.findUnique({ where: { id: milestoneId } });
        if (paid?.status === 'PAID') {
          await this.notificationsService.createNotification(
            milestone.contract.freelancerId,
            'MILESTONE_APPROVED',
            `Milestone "${milestone.title}" has been approved and paid`,
            { contractId: milestone.contractId, milestoneId },
          );
          await this.maybeAutoCompleteContract(milestone.contractId);
          return paid;
        }
      } catch (e) {
        throw e;
      }
    }

    const updated = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'APPROVED' },
    });

    // Notify freelancer
    await this.notificationsService.createNotification(
      milestone.contract.freelancerId,
      'MILESTONE_APPROVED',
      `Milestone "${milestone.title}" has been approved`,
      {
        contractId: milestone.contractId,
        milestoneId,
      },
    );

    // Auto-complete contract if all milestones are now PAID (for non-Stripe case)
    if (!milestone.stripePaymentIntentId) {
      await this.maybeAutoCompleteContract(milestone.contractId);
    }

    return updated;
  }

  /** Mark milestone as completed (freelancer action) */
  async completeMilestone(milestoneId: string, freelancerId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: true,
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.contract.freelancerId !== freelancerId) {
      throw new ForbiddenException('Only the freelancer can mark milestones as completed');
    }

    const updated = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'COMPLETED' },
    });

    // Notify client
    await this.notificationsService.createNotification(
      milestone.contract.clientId,
      'MILESTONE_COMPLETED',
      `Milestone "${milestone.title}" has been marked as completed`,
      {
        contractId: milestone.contractId,
        milestoneId,
      },
    );

    return updated;
  }

  /** Terminate contract (client or freelancer) */
  async terminateContract(contractId: string, userId: string, reason?: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { client: true, freelancer: true, project: { select: { title: true } } },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (contract.status !== 'ACTIVE') {
      throw new BadRequestException('Contract is not active');
    }

    const now = new Date();
    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'TERMINATED',
        endDate: now,
        terminatedBy: userId,
        terminationReason: reason || null,
        terminatedAt: now,
      },
    });

    // Update project status
    await this.prisma.project.update({
      where: { id: contract.projectId },
      data: { status: 'CANCELLED' },
    });

    const otherUserId = userId === contract.clientId ? contract.freelancerId : contract.clientId;
    await this.notificationsService.createNotification(
      otherUserId,
      'CONTRACT_TERMINATED',
      `Contract for "${contract.project.title}" has been terminated`,
      { contractId, reason },
    );

    return updated;
  }

  /** Complete contract (client action, or auto when all milestones paid) */
  async completeContract(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { milestones: true, project: { select: { title: true } } },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.clientId !== userId) {
      throw new ForbiddenException('Only the client can mark contract as completed');
    }

    if (contract.status !== 'ACTIVE') {
      throw new BadRequestException('Contract is not active');
    }

    const allPaid = contract.milestones.length > 0 && contract.milestones.every((m) => m.status === 'PAID');
    if (!allPaid) {
      throw new BadRequestException('All milestones must be paid before completing the contract');
    }

    const now = new Date();
    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: { status: 'COMPLETED', endDate: now },
    });

    await this.prisma.project.update({
      where: { id: contract.projectId },
      data: { status: 'COMPLETED' },
    });

    await this.notificationsService.createNotification(
      contract.freelancerId,
      'CONTRACT_COMPLETED',
      `Contract for "${contract.project.title}" has been completed`,
      { contractId },
    );

    return updated;
  }

  /** Auto-complete contract when last milestone is paid (called from approveMilestone) */
  async maybeAutoCompleteContract(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { milestones: true },
    });
    if (!contract || contract.status !== 'ACTIVE') return;
    const allPaid = contract.milestones.length > 0 && contract.milestones.every((m) => m.status === 'PAID');
    if (allPaid) {
      await this.prisma.contract.update({
        where: { id: contractId },
        data: { status: 'COMPLETED', endDate: new Date() },
      });
      await this.prisma.project.update({
        where: { id: contract.projectId },
        data: { status: 'COMPLETED' },
      });
    }
  }

  /** Get contract stats for dashboard */
  async getStats(userId: string, role: 'CLIENT' | 'FREELANCER') {
    const where = role === 'CLIENT' ? { clientId: userId } : { freelancerId: userId };

    const [total, active, completed, terminated, contracts] = await Promise.all([
      this.prisma.contract.count({ where }),
      this.prisma.contract.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.contract.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.contract.count({ where: { ...where, status: 'TERMINATED' } }),
      this.prisma.contract.findMany({
        where,
        include: {
          milestones: { where: { status: 'PAID' } },
          project: { select: { title: true } },
        },
      }),
    ]);

    let totalEarnedCents = 0;
    let totalSpentCents = 0;
    for (const c of contracts) {
      if (role === 'FREELANCER') {
        const netEarned = c.milestones.reduce((sum, m) => sum + (m.amount - (m.freelancerFee || 0)), 0);
        totalEarnedCents += netEarned;
      } else {
        const grossSpent = c.milestones.reduce((sum, m) => sum + (m.amount + (m.clientFee || 0)), 0);
        totalSpentCents += grossSpent;
      }
    }

    return {
      total,
      active,
      completed,
      terminated,
      totalEarned: role === 'FREELANCER' ? totalEarnedCents / 100 : undefined,
      totalSpent: role === 'CLIENT' ? totalSpentCents / 100 : undefined,
    };
  }

  /** Update contract terms (client or freelancer, when ACTIVE) */
  async updateTerms(contractId: string, userId: string, terms: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: { clientId: true, freelancerId: true, status: true },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (contract.status !== 'ACTIVE') {
      throw new BadRequestException('Contract is not active');
    }

    return this.prisma.contract.update({
      where: { id: contractId },
      data: { terms },
    });
  }

  /** Get all milestones for a contract */
  async getMilestones(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: {
        clientId: true,
        freelancerId: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const milestones = await this.prisma.milestone.findMany({
      where: { contractId },
      include: {
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return milestones;
  }
}


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
import { ConversationsService } from '../conversations/conversations.service';
import { CreateProposalDto } from './dto/create-proposal.dto';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly conversationsService: ConversationsService,
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

  /** Create a proposal for a project */
  async create(freelancerId: string, projectId: string, dto: CreateProposalDto) {
    // Verify project exists and is open
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== 'OPEN') {
      throw new BadRequestException('Project is not open for proposals');
    }

    // Check if freelancer already submitted a proposal
    const existing = await this.prisma.proposal.findFirst({
      where: {
        projectId,
        freelancerId,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already submitted a proposal for this project');
    }

    // Verify user is a freelancer
    const user = await this.prisma.user.findUnique({
      where: { id: freelancerId },
      select: { role: true },
    });

    if (user?.role !== 'FREELANCER') {
      throw new ForbiddenException('Only freelancers can submit proposals');
    }

    // Create proposal
    const proposal = await this.prisma.proposal.create({
      data: {
        projectId,
        freelancerId,
        coverLetter: dto.coverLetter,
        proposedBudget: dto.proposedBudget,
        status: 'PENDING',
      },
      include: {
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
      },
    });

    // Notify client
    await this.notificationsService.createNotification(
      project.clientId,
      'NEW_PROPOSAL',
      `You received a new proposal for "${project.title}"`,
      {
        projectId,
        proposalId: proposal.id,
        freelancerId,
      },
    );

    return proposal;
  }

  /** Get all proposals for a project (client view) */
  async findByProject(projectId: string, clientId: string) {
    // Verify project belongs to client
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.clientId !== clientId) {
      throw new ForbiddenException('Access denied');
    }

    const proposals = await this.prisma.proposal.findMany({
      where: { projectId },
      include: {
        freelancer: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
                headline: true,
                skills: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return proposals;
  }

  /** Get proposals submitted by a freelancer */
  async findByFreelancer(freelancerId: string) {
    const proposals = await this.prisma.proposal.findMany({
      where: { freelancerId },
      include: {
        project: {
          include: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return proposals;
  }

  /** Accept a proposal (client action) */
  async accept(proposalId: string, clientId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.project.clientId !== clientId) {
      throw new ForbiddenException('Only the project owner can accept proposals');
    }

    if (proposal.status !== 'PENDING') {
      throw new BadRequestException('Proposal has already been processed');
    }

    // Check if project already has a contract
    const existingContract = await this.prisma.contract.findUnique({
      where: { projectId: proposal.projectId },
    });

    if (existingContract) {
      throw new BadRequestException('Project already has an active contract');
    }

    // Update proposal status
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'ACCEPTED' },
    });

    // Reject all other proposals for this project
    await this.prisma.proposal.updateMany({
      where: {
        projectId: proposal.projectId,
        id: { not: proposalId },
        status: 'PENDING',
      },
      data: { status: 'REJECTED' },
    });

    // Create contract (agreement: client accepts proposal = both parties agreed)
    const now = new Date();
    const contract = await this.prisma.contract.create({
      data: {
        projectId: proposal.projectId,
        proposalId: proposalId,
        freelancerId: proposal.freelancerId,
        clientId: clientId,
        agreedBudget: proposal.proposedBudget || proposal.project.budgetMax || proposal.project.budgetMin || 0,
        clientAcceptedAt: now,
        freelancerAcceptedAt: now,
      },
      include: {
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
        project: {
          select: {
            title: true,
          },
        },
      },
    });

    // Update project status
    await this.prisma.project.update({
      where: { id: proposal.projectId },
      data: { status: 'IN_PROGRESS' },
    });

    // Notify freelancer
    await this.notificationsService.createNotification(
      proposal.freelancerId,
      'PROPOSAL_ACCEPTED',
      `Your proposal for "${proposal.project.title}" has been accepted!`,
      {
        projectId: proposal.projectId,
        contractId: contract.id,
      },
    );

    // Create project-linked conversation so client and freelancer can chat about the project
    try {
      await this.conversationsService.create(clientId, {
        freelancerId: proposal.freelancerId,
        projectId: proposal.projectId,
      });
    } catch {
      // Conversation may already exist; ignore
    }

    return contract;
  }

  /** Reject a proposal (client action) */
  async reject(proposalId: string, clientId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.project.clientId !== clientId) {
      throw new ForbiddenException('Only the project owner can reject proposals');
    }

    if (proposal.status !== 'PENDING') {
      throw new BadRequestException('Proposal has already been processed');
    }

    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'REJECTED' },
    });

    // Notify freelancer
    await this.notificationsService.createNotification(
      proposal.freelancerId,
      'PROPOSAL_REJECTED',
      `Your proposal for "${proposal.project.title}" has been rejected`,
      {
        projectId: proposal.projectId,
      },
    );

    return { message: 'Proposal rejected' };
  }

  /** Get a single proposal */
  async findOne(proposalId: string, userId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: {
          include: {
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
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
                headline: true,
                skills: true,
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Check access: client or freelancer who submitted it
    if (proposal.project.clientId !== userId && proposal.freelancerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return proposal;
  }
}


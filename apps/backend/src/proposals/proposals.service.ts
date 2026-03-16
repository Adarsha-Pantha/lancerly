import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConversationsService } from '../conversations/conversations.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';
export { GenerateDraftDto };
import { ModerationService } from '../common/moderation/moderation.service';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly conversationsService: ConversationsService,
    private readonly moderationService: ModerationService,
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

    // AI Content Moderation scan BEFORE creation
    let moderation = await this.moderationService.analyzeContent(dto.coverLetter);

    if (moderation.status === 'BLOCKED') {
      throw new BadRequestException(`Proposal rejected: ${moderation.notes}`);
    }

    let coverLetter = dto.coverLetter;
    if (moderation.status === 'FLAGGED') {
      coverLetter = await this.moderationService.sanitizeContent(dto.coverLetter);
      moderation = await this.moderationService.analyzeContent(coverLetter);
    }

    // Create proposal
    const proposal = await this.prisma.proposal.create({
      data: {
        projectId,
        freelancerId,
        coverLetter,
        proposedBudget: dto.proposedBudget,
        status: 'PENDING',
        moderationStatus: moderation.status,
        moderationNotes: moderation.notes,
      } as any,
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

  /** Generate a proposal draft using Groq (Llama 3.1 — free) */
  async generateProposalDraft(dto: GenerateDraftDto): Promise<{ draft: string }> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'GROQ_API_KEY is not configured. Add it to your .env file. Get a free key at console.groq.com',
      );
    }

    const skillsList = dto.skills?.length ? dto.skills.join(', ') : 'general professional skills';
    const existingNote = dto.existingText?.trim()
      ? `\n\nThe freelancer has also started writing:\n"${dto.existingText.trim()}"\nImprove upon this and make it more compelling.`
      : '';

    const systemPrompt = `You are an expert freelance proposal writer. Your task is to write a compelling, professional proposal for a freelancer applying to a project. Write the proposal IN FIRST PERSON as if you are the freelancer.

Structure the proposal EXACTLY in these four sections with markdown headers:

## Introduction
(2-3 sentences: who you are, your excitement for this specific project, relevant experience highlight)

## My Plan
(3-5 bullet points: specific approach, methodology, and how you'll deliver the project successfully)

## Timeline
(Realistic delivery estimate broken into phases/milestones. Be specific but achievable.)

## Clarifying Questions
(2-3 smart questions that show you've read the brief carefully and care about getting it right)

Keep the tone confident, professional, and personalized to the project. Do NOT use placeholder text. Make it feel authentic. Maximum 350 words total.`;

    const userPrompt = `Project Title: ${dto.projectTitle}
Project Description: ${dto.projectDescription || 'Not provided'}
Required Skills: ${skillsList}${existingNote}

Write the proposal now:`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new InternalServerErrorException(`Groq API error: ${err}`);
      }

      const data = (await response.json()) as {
        choices: { message: { content: string } }[];
      };
      const draft = data.choices?.[0]?.message?.content?.trim();

      if (!draft) throw new InternalServerErrorException('No response from AI');
      return { draft };
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to connect to AI service');
    }
  }
}


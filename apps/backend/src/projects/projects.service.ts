import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ModerationService } from '../common/moderation/moderation.service';
import { AiService } from '../ai/ai.service';

type ProjectKind = 'CLIENT_REQUEST' | 'FREELANCER_SHOWCASE';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly moderationService: ModerationService,
    private readonly aiService: AiService,
  ) {}


  /** Extract userId from "Authorization: Bearer <token>" header */
  async userIdFromAuth(auth?: string) {
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.slice(7);
    const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');
    return payload.sub;
  }

  private async resolveUserRole(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user.role;
  }

  /** Get project creation quota for a client */
  async getProjectQuota(clientId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: clientId },
      select: { role: true, isSubscribed: true },
    });

    console.log(`[Quota] Checking quota for ${clientId}: role=${user?.role}, isSubscribed=${user?.isSubscribed}`);

    if (!user || user.role !== 'CLIENT') {
      return { limit: null, used: 0, remaining: null, isSubscribed: false };
    }

    if (user.isSubscribed) {
      return { limit: null, used: 0, remaining: null, isSubscribed: true };
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [used, settings] = await Promise.all([
      this.prisma.project.count({
        where: { clientId, createdAt: { gte: oneWeekAgo } },
      }),
      this.prisma.platformSettings.upsert({
        where: { id: 'singleton' },
        update: {},
        create: { id: 'singleton' },
      }),
    ]);

    const limit = settings.weeklyProjectLimit;
    const remaining = Math.max(0, limit - used);
    return { limit, used, remaining, isSubscribed: false };
  }

  /** Create a new project */
  async create(clientId: string, dto: CreateProjectDto, assetUrls: string[] = []) {
    console.log('--- CRITICAL: ProjectsService.create called ---');
    console.log('Title:', dto.title);
    console.log('Description:', dto.description);
    
    const user = await this.prisma.user.findUnique({
      where: { id: clientId },
      select: { role: true, isSubscribed: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    console.log(`[CreateProject] User ${clientId}: role=${user.role}, isSubscribed=${user.isSubscribed}`);

    const projectType: ProjectKind =
      user.role === 'FREELANCER' ? 'FREELANCER_SHOWCASE' : 'CLIENT_REQUEST';

    // Check project creation limit for non-subscribed clients
    if (user.role === 'CLIENT' && !user.isSubscribed) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [projectCount, settings] = await Promise.all([
        this.prisma.project.count({
          where: {
            clientId,
            createdAt: { gte: oneWeekAgo },
          },
        }),
        this.prisma.platformSettings.upsert({
          where: { id: 'singleton' },
          update: {},
          create: { id: 'singleton' },
        }),
      ]);

      if (projectCount >= settings.weeklyProjectLimit) {
        throw new ForbiddenException(
          `Project creation limit reached (${settings.weeklyProjectLimit} per week). Please upgrade to Premium for unlimited projects.`,
        );
      }
    }

    // AI Content Moderation scan BEFORE creation
    let moderation = await this.moderationService.analyzeContent(`${dto.title} ${dto.description}`);

    if (moderation.status === 'BLOCKED') {
      throw new BadRequestException(`Project creation rejected: ${moderation.notes}`);
    }

    let { title, description } = dto;
    if (moderation.status === 'FLAGGED') {
      this.logger.warn(`Project flagged for ${moderation.notes}. Attempting automatic cleaning...`);
      title = await this.moderationService.sanitizeContent(dto.title);
      description = await this.moderationService.sanitizeContent(dto.description);
      // Re-scan sanitized content to be safe
      moderation = await this.moderationService.analyzeContent(`${title} ${description}`);
    }

    const data: any = {
      clientId,
      title,
      description,
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      skills: dto.skills || [],
      attachments: assetUrls,
      screeningQuestions: dto.screeningQuestions || [],
      acceptanceCriteria: dto.acceptanceCriteria || [],
      projectType,
      status: 'OPEN',
      moderationStatus: moderation.status,
      moderationNotes: moderation.notes,
    };

    try {
      const contentToEmbed = [title, description, dto.skills?.join(', ')].filter(Boolean).join('\n');
      data.embedding = await this.aiService.generateEmbedding(contentToEmbed);
    } catch (e) {
      this.logger.error('Failed to generate embedding on project creation', e);
    }

    const project = await this.prisma.project.create({
      data,
      include: {
        client: {
          select: {
            id: true,
            email: true,
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

    return project;
  }

  /** Get all projects (with optional filters) */
  async findAll(filters?: {
    status?: string;
    keyword?: string;
    skills?: string[];
    clientId?: string;
    type?: ProjectKind;
  }) {
    const where: any = {
      moderationStatus: 'APPROVED'
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    if (filters?.skills && filters.skills.length > 0) {
      where.skills = { hasSome: filters.skills };
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.type) {
      where.projectType = filters.type;
    }

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            email: true,
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
            proposals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  }

  /** Calculate best project matches for a freelancer using AI embeddings */
  async getMatches(freelancerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: freelancerId },
      include: { profile: true },
    });

    if (!user || user.role !== 'FREELANCER') {
      throw new ForbiddenException('Only freelancers can request project matches');
    }

    if (!user.profile?.skills || !Array.isArray(user.profile.skills) || user.profile.skills.length === 0) {
      throw new BadRequestException('MISSING_SKILLS');
    }

    let profileEmbedding = user.profile.embedding;
    if (!profileEmbedding || profileEmbedding.length === 0) {
      const skillsRaw = user.profile.skills;
      const skillsStr = Array.isArray(skillsRaw) ? skillsRaw.join(', ') : String(skillsRaw || '');
      const contentToEmbed = [
        user.profile.headline || '',
        user.profile.bio || '',
        skillsStr
      ].filter(Boolean).join('\n');
      
      profileEmbedding = await this.aiService.generateEmbedding(contentToEmbed);
      
      if (profileEmbedding.length > 0) {
        await this.prisma.profile.update({
          where: { id: user.profile.id },
          data: { embedding: profileEmbedding }
        });
      } else {
        throw new BadRequestException('PROFILE_EMBEDDING_PENDING');
      }
    }

    const openProjects = await this.prisma.project.findMany({
      where: {
        status: 'OPEN',
        projectType: 'CLIENT_REQUEST',
        moderationStatus: 'APPROVED',
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
        _count: { select: { proposals: true } },
      },
    });

    const userSkills = new Set((user.profile.skills as unknown as string[]).map(s => String(s).toLowerCase()));

    const scoredProjects = openProjects
      .filter(p => p.embedding && p.embedding.length > 0)
      .map(p => {
        const score = this.aiService.computeCosineSimilarity(
           profileEmbedding, 
           p.embedding
        );

        let overlap = 0;
        if (p.skills && p.skills.length > 0) {
           overlap = p.skills.filter(s => userSkills.has(String(s).toLowerCase())).length;
        }
        
        // Boost score slightly for matching exact skills
        const finalScore = score + Math.min(overlap * 0.05, 0.25);

        const { embedding, ...projectWithoutEmbedding } = p;
        return { ...projectWithoutEmbedding, matchScore: finalScore };
      })
      .filter(p => p.matchScore > 0.4)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    return scoredProjects;
  }

  /** Get a single project by ID with client profile */
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            stripeCustomerId: true,
            profile: {
              select: {
                name: true,
                headline: true,
                avatarUrl: true,
                skills: true,
                country: true,
                kycStatus: true,
              },
            },
            projects: {
              select: {
                status: true,
              },
            },
            receivedReviews: {
              select: {
                rating: true,
              },
            },
          },
        },
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Enrich client stats
    if (project.client) {
      const allProjects = project.client.projects || [];
      const postedJobs = allProjects.length;
      const openJobs = allProjects.filter((p) => p.status === 'OPEN').length;
      const hiredJobs = allProjects.filter(
        (p) => p.status !== 'OPEN' && p.status !== 'CANCELLED',
      ).length;
      const hireRate =
        postedJobs > 0 ? Math.round((hiredJobs / postedJobs) * 100) : 0;

      const reviewCount = project.client.receivedReviews.length;
      const rating =
        reviewCount > 0
          ? project.client.receivedReviews.reduce((sum, r) => sum + r.rating, 0) /
            reviewCount
          : 0;

      const clientEnriched = {
        ...project.client,
        stats: {
          postedJobs,
          openJobs,
          hireRate,
        },
        rating,
        reviewCount,
      };

      // Clean up the raw projects and reviews list to keep response slim
      delete (clientEnriched as any).projects;
      delete (clientEnriched as any).receivedReviews;

      return {
        ...project,
        client: clientEnriched,
      };
    }

    return project;
  }

  /** Update a project (only by owner or admin) */
  async update(
    userId: string,
    id: string,
    dto: UpdateProjectDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is the owner or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && project.clientId !== userId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    const updatedData: any = {
      ...(dto.title && { title: dto.title }),
      ...(dto.description && { description: dto.description }),
      ...(dto.budgetMin !== undefined && { budgetMin: dto.budgetMin }),
      ...(dto.budgetMax !== undefined && { budgetMax: dto.budgetMax }),
      ...(dto.skills && { skills: dto.skills }),
      ...(dto.status && { status: dto.status }),
      ...(dto.screeningQuestions && { screeningQuestions: dto.screeningQuestions }),
      ...(dto.acceptanceCriteria && { acceptanceCriteria: dto.acceptanceCriteria }),
    };

    if (dto.title || dto.description || dto.skills) {
      try {
        const currentData = await this.prisma.project.findUnique({ where: { id } });
        const contentToEmbed = [
          dto.title || currentData?.title || '',
          dto.description || currentData?.description || '',
          dto.skills?.join(', ') || currentData?.skills?.join(', ') || ''
        ].filter(Boolean).join('\n');
        updatedData.embedding = await this.aiService.generateEmbedding(contentToEmbed);
      } catch (e) {
        this.logger.error('Failed to generate embedding on project update', e);
      }
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: updatedData,
      include: {
        client: {
          select: {
            id: true,
            email: true,
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

    // AI Content Moderation re-scan
    if (dto.title || dto.description) {
      const moderation = await this.moderationService.analyzeContent(`${updated.title} ${updated.description}`);
      
      if (moderation.status === 'FLAGGED' || moderation.status === 'BLOCKED') {
        // We revert or flag it if it was already updated? 
        // For update, we definitely set it to FLAGGED so it disappears from browse.
      }

      await (this.prisma.project as any).update({
        where: { id: updated.id },
        data: {
          moderationStatus: moderation.status,
          moderationNotes: moderation.notes,
        }
      });
      // Refresh the updated object
      return await this.findOne(updated.id);
    }

    return updated;
  }

  /** Attach uploaded asset paths to a project */
  async addAttachments(userId: string, id: string, assetUrls: string[]) {
    if (!assetUrls.length) {
      throw new BadRequestException('No files uploaded');
    }

    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && project.clientId !== userId) {
      throw new ForbiddenException('You can only modify your own projects');
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        attachments: {
          push: assetUrls,
        },
      } as any,
      include: {
        client: {
          select: {
            id: true,
            email: true,
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
            proposals: true,
          },
        },
      },
    });

    return updated;
  }

  /** Archive a project (soft delete by setting status to CANCELLED) */
  async archive(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is the owner or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && project.clientId !== userId) {
      throw new ForbiddenException('You can only archive your own projects');
    }

    const archived = await this.prisma.project.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
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

    return archived;
  }

  /** Change project status */
  async changeStatus(
    userId: string,
    id: string,
    status: string,
  ) {
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is the owner or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && project.clientId !== userId) {
      throw new ForbiddenException('You can only change status of your own projects');
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        status,
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
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

    return updated;
  }

  /** Delete a project (only by owner or admin) */
  async remove(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is the owner or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && project.clientId !== userId) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  /** Get projects created by the current user */
  async findMyProjects(clientId: string) {
    const projects = await this.prisma.project.findMany({
      where: { clientId },
      include: {
        _count: {
          select: {
            proposals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  }
}


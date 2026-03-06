import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

type ProjectKind = 'CLIENT_REQUEST' | 'FREELANCER_SHOWCASE';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
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

  /** Create a new project */
  async create(clientId: string, dto: CreateProjectDto, assetUrls: string[] = []) {
    const role = await this.resolveUserRole(clientId);
    const projectType: ProjectKind =
      role === 'FREELANCER' ? 'FREELANCER_SHOWCASE' : 'CLIENT_REQUEST';

    const data: any = {
      clientId,
      title: dto.title,
      description: dto.description,
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      skills: dto.skills || [],
      attachments: assetUrls,
      projectType,
      status: 'OPEN',
    };

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
    const where: any = {};

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

  /** Get a single project by ID with client profile */
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                headline: true,
                avatarUrl: true,
                skills: true,
                country: true,
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

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.budgetMin !== undefined && { budgetMin: dto.budgetMin }),
        ...(dto.budgetMax !== undefined && { budgetMax: dto.budgetMax }),
        ...(dto.skills && { skills: dto.skills }),
        ...(dto.status && { status: dto.status }),
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


// apps/backend/src/profile/profile.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';

const PROFILE_INCLUDE = {
  profile: true,
  portfolioProjects: { orderBy: { createdAt: 'desc' as const } },
  projects: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      contract: {
        include: {
          reviews: true,
          milestones: { where: { status: 'PAID' } },
        },
      },
      _count: { select: { proposals: true } },
    },
  },
  contractsAsFreelancer: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      project: {
        include: {
          _count: { select: { proposals: true } },
        },
      },
      reviews: true,
      milestones: { where: { status: 'PAID' } },
    },
  },
  receivedReviews: { select: { rating: true } },
  contractsAsClient: {
    include: { milestones: { where: { status: 'PAID' } } },
  },
} satisfies Prisma.UserInclude;

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async userIdFromAuth(auth?: string) {
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.slice(7);
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async getMine(auth?: string) {
    const userId = await this.userIdFromAuth(auth);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: PROFILE_INCLUDE,
    });
    if (!user) throw new UnauthorizedException('User not found');

    let totalSpending = 0;
    if (user.role === 'CLIENT' && user.contractsAsClient) {
      user.contractsAsClient.forEach((c) => {
        c.milestones.forEach((m) => {
          totalSpending += m.amount;
        });
      });
    }

    const reviewCount = user.receivedReviews.length;
    const rating = reviewCount > 0 
      ? user.receivedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
      : 0;

    const unifiedProjects = user.role === 'CLIENT' 
      ? user.projects 
      : (user.contractsAsFreelancer || []).map(c => ({
          ...c.project,
          contract: { ...c, project: undefined }
        }));

    return {
      ...user,
      postedJobs: user.projects.length,
      totalSpending: totalSpending / 100,
      reviewCount,
      rating,
      projects: unifiedProjects,
    };
  }

  async getById(id: string, auth?: string) {
    let currentUserId: string | null = null;
    try { if (auth) currentUserId = await this.userIdFromAuth(auth); } catch {}

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: PROFILE_INCLUDE,
    });

    if (!user) throw new NotFoundException('User not found');

    let isFriend = false;
    if (currentUserId) {
      const f = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: currentUserId, friendId: id },
            { userId: id, friendId: currentUserId },
          ],
        },
      });
      isFriend = !!f;
    }

    let totalSpending = 0;
    if (user.role === 'CLIENT' && user.contractsAsClient) {
      user.contractsAsClient.forEach((c) => {
        c.milestones.forEach((m) => {
          totalSpending += m.amount;
        });
      });
    }

    const reviewCount = user.receivedReviews.length;
    const rating = reviewCount > 0 
      ? user.receivedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
      : 0;

    const unifiedProjects = user.role === 'CLIENT' 
      ? user.projects 
      : (user.contractsAsFreelancer || []).map(c => ({
          ...c.project,
          contract: { ...c, project: undefined }
        }));

    return {
      ...user,
      isFriend,
      isOwnProfile: currentUserId === id,
      postedJobs: user.projects.length,
      totalSpending: totalSpending / 100,
      reviewCount,
      rating,
      projects: unifiedProjects,
    };
  }

  async addPortfolioProject(auth: string, dto: any, imageUrl?: string) {
    const userId = await this.userIdFromAuth(auth);
    let skillsArray: string[] = [];
    if (typeof dto.skills === 'string') {
      try { skillsArray = JSON.parse(dto.skills); } catch { skillsArray = dto.skills.split(',').map((s: any) => s.trim()); }
    } else if (Array.isArray(dto.skills)) {
      skillsArray = dto.skills;
    }

    return this.prisma.portfolioProject.create({
      data: {
        freelancerId: userId,
        title: dto.title,
        description: dto.description,
        skills: skillsArray,
        imageUrl,
        liveLink: dto.liveLink,
      },
    });
  }

  async updateMine(auth: string, dto: CompleteProfileDto, avatarUrl?: string) {
    const userId = await this.userIdFromAuth(auth);
    return this.prisma.profile.update({
      where: { userId },
      data: {
        avatarUrl: avatarUrl || undefined,
        name: dto.name,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        country: dto.country,
        phone: dto.phone,
        street: dto.street,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        isComplete: true,
      },
    });
  }

  async updateKyc(auth: string, front: string, back: string) {
    const userId = await this.userIdFromAuth(auth);
    return this.prisma.profile.update({
      where: { userId },
      data: {
        kycStatus: 'PENDING',
        kycFrontImage: front,
        kycBackImage: back,
      },
    });
  }
}

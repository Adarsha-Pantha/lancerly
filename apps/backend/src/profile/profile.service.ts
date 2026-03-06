// apps/backend/src/profile/profile.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Extract userId from "Authorization: Bearer <token>" header */
  private async userIdFromAuth(auth?: string) {
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.slice(7);
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      if (!payload?.sub) throw new UnauthorizedException('Invalid token');
      return payload.sub;
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired. Please log in again.');
      }
      if (err?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException(err?.message ?? 'Authentication failed');
    }
  }

  /** GET /profile (current user) */
  async getMine(auth?: string) {
    const userId = await this.userIdFromAuth(auth);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            headline: true,
            bio: true,
            skills: true,
            avatarUrl: true,
            dob: true,
            country: true,
            phone: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            availability: true,
            isComplete: true,
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  /** GET /profile/:id (public profile view) */
  async getById(targetUserId: string, auth?: string) {
    // Get current user ID if authenticated (to check friendship status)
    let currentUserId: string | null = null;
    try {
      if (auth) {
        currentUserId = await this.userIdFromAuth(auth);
      }
    } catch {
      // Not authenticated, that's fine
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            headline: true,
            bio: true,
            skills: true,
            avatarUrl: true,
            dob: true,
            country: true,
            city: true,
            state: true,
            availability: true,
            // Don't expose sensitive info like phone, street, postalCode for public profiles
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if current user is friends with this user
    let isFriend = false;
    if (currentUserId) {
      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: currentUserId, friendId: targetUserId },
            { userId: targetUserId, friendId: currentUserId },
          ],
        },
      });
      isFriend = !!friendship;
    }

    return {
      ...user,
      isFriend,
      isOwnProfile: currentUserId === targetUserId,
    };
  }

  /**
   * PUT /profile
   * Merges existing profile with incoming DTO and optional avatarUrl,
   * recomputes isComplete, and normalizes null -> undefined for Prisma types.
   */
  async updateMine(
    auth: string | undefined,
    dto: CompleteProfileDto,
    avatarUrl?: string,
  ) {
    const userId = await this.userIdFromAuth(auth);

    // Ensure profile row exists (create if missing)
    const current = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        name: '',
        availability: true,
      },
      update: {},
    });

    // Merge current + incoming so completeness check uses final values
    const merged = {
      name: dto.name ?? current.name ?? null,
      dob: dto.dob ? new Date(dto.dob) : current.dob ?? null,
      country: dto.country ?? current.country ?? null,
      phone: dto.phone ?? current.phone ?? null,
      street: dto.street ?? current.street ?? null,
      city: dto.city ?? current.city ?? null,
      state: dto.state ?? current.state ?? null,
      postalCode: dto.postalCode ?? current.postalCode ?? null,
      avatarUrl:
        avatarUrl !== undefined
          ? avatarUrl
          : current.avatarUrl ?? null,
    };

    // Compute completeness
    const required = [
      merged.name,
      merged.country,
      merged.phone,
      merged.street,
      merged.city,
      merged.state,
      merged.postalCode,
    ];
    const isComplete = required.every((v) => !!v && String(v).trim().length > 0);

    // ✅ Normalize null -> undefined to satisfy Prisma types
    const normalized = {
      name: merged.name ?? undefined,
      dob: merged.dob ?? undefined,
      country: merged.country ?? undefined,
      phone: merged.phone ?? undefined,
      street: merged.street ?? undefined,
      city: merged.city ?? undefined,
      state: merged.state ?? undefined,
      postalCode: merged.postalCode ?? undefined,
      avatarUrl: merged.avatarUrl ?? undefined,
      isComplete,
    };

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: normalized,
      select: {
        name: true,
        avatarUrl: true,
        dob: true,
        country: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        postalCode: true,
        isComplete: true,
      },
    });

    return updated;
  }
}

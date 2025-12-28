import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async searchUsers(currentUserId: string, query: string) {
    const q = query.trim();
    if (!q) {
      throw new BadRequestException('Query is required');
    }

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              {
                profile: {
                  name: { contains: q, mode: 'insensitive' },
                },
              },
            ],
          },
        ],
      },
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
      take: 20,
    });

    // Mark which ones are already friends
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { userId: currentUserId, friendId: { in: users.map((u) => u.id) } },
          { friendId: currentUserId, userId: { in: users.map((u) => u.id) } },
        ],
      },
      select: {
        userId: true,
        friendId: true,
      },
    });

    const friendSet = new Set<string>();
    friendships.forEach((f) => {
      const otherId = f.userId === currentUserId ? f.friendId : f.userId;
      friendSet.add(otherId);
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.profile?.name ?? null,
      avatarUrl: u.profile?.avatarUrl ?? null,
      isFriend: friendSet.has(u.id),
    }));
  }

  async listFriends(currentUserId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId: currentUserId }, { friendId: currentUserId }],
      },
      include: {
        user: {
          include: {
            profile: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        friend: {
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

    return friendships.map((f) => {
      const other =
        f.userId === currentUserId ? f.friend : f.user;
      return {
        id: other.id,
        email: other.email,
        name: other.profile?.name ?? null,
        avatarUrl: other.profile?.avatarUrl ?? null,
        since: f.createdAt,
      };
    });
  }

  async addFriend(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('Cannot add yourself as a friend');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    // Check if already friends (in either direction)
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUserId, friendId: targetUserId },
          { userId: targetUserId, friendId: currentUserId },
        ],
      },
    });

    if (existing) {
      return existing;
    }

    // Create a single friendship record (treat as mutual)
    return this.prisma.friendship.create({
      data: {
        userId: currentUserId,
        friendId: targetUserId,
      },
    });
  }
}



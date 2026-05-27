import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const PROFILE_SELECT = {
  select: { name: true, avatarUrl: true, headline: true },
} as const;

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ── helpers ────────────────────────────────────────────────────────────────

  private async getExisting(userA: string, userB: string) {
    return this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userA, friendId: userB },
          { userId: userB, friendId: userA },
        ],
      },
    });
  }

  private userShape(u: any) {
    return {
      id: u.id,
      email: u.email,
      name: u.profile?.name ?? null,
      avatarUrl: u.profile?.avatarUrl ?? null,
      headline: u.profile?.headline ?? null,
    };
  }

  // ── search ─────────────────────────────────────────────────────────────────

  async searchUsers(currentUserId: string, query: string) {
    const q = query.trim();
    if (!q) throw new BadRequestException('Query is required');

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { profile: { name: { contains: q, mode: 'insensitive' } } },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        profile: { select: { name: true, avatarUrl: true, headline: true } },
      },
      take: 20,
    });

    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { userId: currentUserId, friendId: { in: users.map((u) => u.id) } },
          { friendId: currentUserId, userId: { in: users.map((u) => u.id) } },
        ],
      },
    });

    const statusMap = new Map<string, 'pending_sent' | 'pending_received' | 'accepted'>();
    friendships.forEach((f) => {
      const other = f.userId === currentUserId ? f.friendId : f.userId;
      if (f.status === 'ACCEPTED') {
        statusMap.set(other, 'accepted');
      } else if (f.status === 'PENDING') {
        statusMap.set(other, f.userId === currentUserId ? 'pending_sent' : 'pending_received');
      }
    });

    return users.map((u) => ({
      ...this.userShape(u),
      friendshipStatus: statusMap.get(u.id) ?? 'none',
    }));
  }

  // ── send request ───────────────────────────────────────────────────────────

  async sendRequest(senderId: string, recipientId: string) {
    if (senderId === recipientId) {
      throw new BadRequestException('Cannot send a request to yourself');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, profile: { select: { name: true } } },
    });
    if (!target) throw new NotFoundException('User not found');

    const existing = await this.getExisting(senderId, recipientId);
    if (existing) {
      if (existing.status === 'ACCEPTED') throw new BadRequestException('Already friends');
      if (existing.status === 'PENDING') throw new BadRequestException('Request already sent');
      // DECLINED — allow re-sending by deleting old record
      await this.prisma.friendship.delete({ where: { id: existing.id } });
    }

    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: { profile: { select: { name: true } } },
    });

    const request = await this.prisma.friendship.create({
      data: { userId: senderId, friendId: recipientId, status: 'PENDING' },
    });

    await this.notifications.createNotification(
      recipientId,
      'FRIEND_REQUEST',
      `${sender?.profile?.name ?? 'Someone'} sent you a friend request`,
      { requestId: request.id, senderId },
    );

    return request;
  }

  // ── accept ─────────────────────────────────────────────────────────────────

  async acceptRequest(
    userId: string,
    requestId: string,
    conversationsService: any,
  ) {
    const request = await this.prisma.friendship.findUnique({
      where: { id: requestId },
      include: { user: { include: { profile: { select: { name: true } } } } },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.friendId !== userId) throw new ForbiddenException('Not your request');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is not pending');

    const updated = await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    // Auto-create direct conversation
    await conversationsService.ensureDirectConversation(request.userId, userId);

    await this.notifications.createNotification(
      request.userId,
      'FRIEND_ACCEPTED',
      `Your friend request was accepted`,
      { requestId, acceptedBy: userId },
    );

    return updated;
  }

  // ── decline ────────────────────────────────────────────────────────────────

  async declineRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendship.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.friendId !== userId && request.userId !== userId) {
      throw new ForbiddenException('Not your request');
    }
    await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'DECLINED' },
    });
    return { success: true };
  }

  // ── cancel (withdraw sent request) ─────────────────────────────────────────

  async cancelRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendship.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.userId !== userId) throw new ForbiddenException('Not your request');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is not pending');
    await this.prisma.friendship.delete({ where: { id: requestId } });
    return { success: true };
  }

  // ── remove friend ──────────────────────────────────────────────────────────

  async removeFriend(userId: string, targetId: string) {
    const existing = await this.getExisting(userId, targetId);
    if (!existing || existing.status !== 'ACCEPTED') {
      throw new NotFoundException('Friendship not found');
    }
    await this.prisma.friendship.delete({ where: { id: existing.id } });
    return { success: true };
  }

  // ── list friends ───────────────────────────────────────────────────────────

  async listFriends(currentUserId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId: currentUserId }, { friendId: currentUserId }],
        status: 'ACCEPTED',
      },
      include: {
        user: { include: { profile: PROFILE_SELECT } },
        friend: { include: { profile: PROFILE_SELECT } },
      },
    });

    return friendships.map((f) => {
      const other = f.userId === currentUserId ? f.friend : f.user;
      return { ...this.userShape(other), since: f.createdAt };
    });
  }

  // ── incoming requests ──────────────────────────────────────────────────────

  async listIncomingRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: { friendId: userId, status: 'PENDING' },
      include: { user: { include: { profile: PROFILE_SELECT } } },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((r) => ({
      requestId: r.id,
      createdAt: r.createdAt,
      ...this.userShape(r.user),
    }));
  }

  // ── sent requests ──────────────────────────────────────────────────────────

  async listSentRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: { userId, status: 'PENDING' },
      include: { friend: { include: { profile: PROFILE_SELECT } } },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((r) => ({
      requestId: r.id,
      createdAt: r.createdAt,
      ...this.userShape(r.friend),
    }));
  }

  // ── legacy: kept for compatibility ────────────────────────────────────────

  async addFriend(senderId: string, recipientId: string) {
    return this.sendRequest(senderId, recipientId);
  }
}

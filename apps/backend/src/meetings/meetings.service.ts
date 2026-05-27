import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);
  private readonly dailyApiKey: string;
  private readonly dailyBaseUrl = 'https://api.daily.co/v1';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
  ) {
    this.dailyApiKey = this.configService.get<string>('DAILY_API_KEY') || '';
  }

  // ── Create a new meeting room and schedule it ──────────────────────────────
  async scheduleMeeting(
    userId: string,
    contractId: string,
    title: string,
    scheduledAt: string,
  ) {
    // Verify contract exists and user is a participant
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        client: { select: { id: true, profile: { select: { name: true } } } },
        freelancer: { select: { id: true, profile: { select: { name: true } } } },
        project: { select: { title: true } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Not a participant of this contract');
    }

    if (contract.status === 'TERMINATED') {
      throw new BadRequestException('Cannot schedule meetings on a terminated contract');
    }

    // Create the Daily.co room (audio-only by default)
    const roomName = `lancerly-${contractId.slice(0, 8)}-${Date.now()}`;
    const roomData = await this.createDailyRoom(roomName);

    const meeting = await this.prisma.meeting.create({
      data: {
        contractId,
        scheduledBy: userId,
        roomName,
        roomUrl: roomData.url,
        title,
        scheduledAt: new Date(scheduledAt),
        status: 'SCHEDULED',
      },
    });

    // Notify the other participant
    const otherUserId =
      contract.clientId === userId ? contract.freelancerId : contract.clientId;
    const schedulerName =
      contract.clientId === userId
        ? contract.client.profile?.name
        : contract.freelancer.profile?.name;

    await this.notifications.createNotification(
      otherUserId,
      'MEETING_SCHEDULED',
      `${schedulerName ?? 'Someone'} scheduled an audio meeting for "${contract.project.title}"`,
      { meetingId: meeting.id, contractId, scheduledAt },
    );

    // Send email notification
    const otherUser = await this.prisma.user.findUnique({
      where: { id: otherUserId },
      select: { email: true, emailNotifications: true, profile: { select: { name: true } } },
    });
    if (otherUser?.emailNotifications) {
      await this.mail.send({
        to: otherUser.email,
        template: 'meeting_scheduled',
        data: {
          name: otherUser.profile?.name ?? 'User',
          schedulerName: schedulerName ?? 'Someone',
          meetingTitle: title,
          scheduledAt: new Date(scheduledAt).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }),
          contractId,
        },
      });
    }

    return meeting;
  }

  // ── List meetings for a contract ──────────────────────────────────────────
  async getMeetingsForContract(userId: string, contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: { clientId: true, freelancerId: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Not a participant of this contract');
    }

    return this.prisma.meeting.findMany({
      where: { contractId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // ── Get single meeting (verifies participant) ─────────────────────────────
  async getMeeting(userId: string, meetingId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        contract: { select: { clientId: true, freelancerId: true } },
      },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const { clientId, freelancerId } = meeting.contract;
    if (clientId !== userId && freelancerId !== userId) {
      throw new ForbiddenException('Not a participant of this meeting');
    }
    return meeting;
  }

  // ── Cancel a meeting ──────────────────────────────────────────────────────
  async cancelMeeting(userId: string, meetingId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        contract: { select: { clientId: true, freelancerId: true } },
      },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const { clientId, freelancerId } = meeting.contract;
    if (clientId !== userId && freelancerId !== userId) {
      throw new ForbiddenException('Not a participant of this meeting');
    }
    if (meeting.status === 'ENDED') {
      throw new BadRequestException('Meeting has already ended');
    }

    return this.prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'CANCELLED' },
    });
  }

  // ── Daily.co REST API helpers ─────────────────────────────────────────────
  private async createDailyRoom(roomName: string): Promise<{ name: string; url: string }> {
    if (!this.dailyApiKey) {
      // Dev fallback: return a mock room so the app runs without a real key
      this.logger.warn('DAILY_API_KEY not set — using mock room URL');
      return {
        name: roomName,
        url: `https://lancerly.daily.co/${roomName}`,
      };
    }

    const expiryTs = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 h

    const res = await fetch(`${this.dailyBaseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.dailyApiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: expiryTs,
          // Audio-only — disable camera by default
          start_video_off: true,
          start_audio_off: false,
          enable_screenshare: false,
          enable_chat: true,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Daily.co room creation failed: ${err}`);
      throw new BadRequestException('Failed to create meeting room');
    }

    const data = (await res.json()) as { name: string; url: string };
    return data;
  }

  // ── Generate a meeting token ──────────────────────────────────────────────
  async getMeetingToken(userId: string, meetingId: string): Promise<{ token: string; roomUrl: string }> {
    const meeting = await this.getMeeting(userId, meetingId);

    if (meeting.status === 'CANCELLED') {
      throw new BadRequestException('This meeting has been cancelled');
    }
    if (meeting.status === 'ENDED') {
      throw new BadRequestException('This meeting has already ended');
    }

    if (!this.dailyApiKey) {
      this.logger.warn(`DAILY_API_KEY not set — returning mock token for meeting ${meetingId}`);
      return { token: 'dev-mock-token', roomUrl: meeting.roomUrl, devMode: true } as any;
    }

    // First person joining: transition SCHEDULED → ACTIVE and notify the other participant
    if (meeting.status === 'SCHEDULED') {
      const full = await this.prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'ACTIVE' },
        include: {
          contract: {
            select: {
              clientId: true,
              freelancerId: true,
              project: { select: { title: true } },
              client: { select: { profile: { select: { name: true } } } },
              freelancer: { select: { profile: { select: { name: true } } } },
            },
          },
        },
      });

      const { clientId, freelancerId } = full.contract;
      const otherUserId = clientId === userId ? freelancerId : clientId;
      const joinerName =
        clientId === userId
          ? full.contract.client.profile?.name
          : full.contract.freelancer.profile?.name;

      await this.notifications.createNotification(
        otherUserId,
        'MEETING_STARTED',
        `${joinerName ?? 'Someone'} started the meeting "${meeting.title}" — join now!`,
        { meetingId, contractId: meeting.contractId },
      );
    }

    const expiryTs = Math.floor(Date.now() / 1000) + 60 * 60 * 4; // 4 h token

    const res = await fetch(`${this.dailyBaseUrl}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.dailyApiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: meeting.roomName,
          exp: expiryTs,
          is_owner: meeting.scheduledBy === userId,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Daily.co token creation failed: ${err}`);
      throw new BadRequestException('Failed to generate meeting token');
    }

    const data = (await res.json()) as { token: string };
    return { token: data.token, roomUrl: meeting.roomUrl };
  }

  // ── Record that a user has left ───────────────────────────────────────────
  async leaveMeeting(userId: string, meetingId: string): Promise<{ ended: boolean }> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        contract: {
          select: {
            clientId: true,
            freelancerId: true,
            project: { select: { title: true } },
            client: { select: { profile: { select: { name: true } } } },
            freelancer: { select: { profile: { select: { name: true } } } },
          },
        },
      },
    });

    if (!meeting) throw new NotFoundException('Meeting not found');
    const { clientId, freelancerId } = meeting.contract;
    if (clientId !== userId && freelancerId !== userId) {
      throw new ForbiddenException('Not a participant of this meeting');
    }

    // Add this user to endedBy (idempotent)
    // Cast needed until Prisma client is regenerated after adding the endedBy column
    const currentEndedBy: string[] = (meeting as any).endedBy ?? [];
    const endedBy = currentEndedBy.includes(userId)
      ? currentEndedBy
      : [...currentEndedBy, userId];

    const bothEnded = endedBy.includes(clientId) && endedBy.includes(freelancerId);

    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        endedBy,
        ...(bothEnded ? { status: 'ENDED' } : {}),
      },
    });

    const otherUserId = clientId === userId ? freelancerId : clientId;
    const leaverName =
      clientId === userId
        ? meeting.contract.client.profile?.name
        : meeting.contract.freelancer.profile?.name;

    if (bothEnded) {
      // Both sides ended — notify both
      for (const uid of [clientId, freelancerId]) {
        await this.notifications.createNotification(
          uid,
          'MEETING_ENDED',
          `The meeting "${meeting.title}" has ended.`,
          { meetingId, contractId: meeting.contractId },
        );
      }
    } else {
      // Other side still in — let them know
      await this.notifications.createNotification(
        otherUserId,
        'MEETING_PARTICIPANT_LEFT',
        `${leaverName ?? 'The other participant'} left the meeting "${meeting.title}". You can end it from your side when ready.`,
        { meetingId, contractId: meeting.contractId },
      );
    }

    return { ended: bothEnded };
  }

  // ── Get upcoming meetings for a user ──────────────────────────────────────
  async getUpcomingMeetingsForUser(userId: string) {
    return this.prisma.meeting.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
        contract: {
          OR: [{ clientId: userId }, { freelancerId: userId }],
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
      select: {
        id: true,
        contractId: true,
        title: true,
        scheduledAt: true,
        status: true,
      },
    });
  }
}

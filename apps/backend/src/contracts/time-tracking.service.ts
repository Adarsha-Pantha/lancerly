import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeTrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
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

  /** Start time tracking */
  async startTimer(contractId: string, freelancerId: string, description?: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.freelancerId !== freelancerId) {
      throw new ForbiddenException('Only the freelancer can track time');
    }

    if (contract.status !== 'ACTIVE') {
      throw new BadRequestException('Contract is not active');
    }

    // Check if there's already a running timer
    const runningTimer = await this.prisma.timeEntry.findFirst({
      where: {
        contractId,
        freelancerId,
        isRunning: true,
      },
    });

    if (runningTimer) {
      throw new BadRequestException('You already have a running timer. Stop it first.');
    }

    const timeEntry = await this.prisma.timeEntry.create({
      data: {
        contractId,
        freelancerId,
        description: description || null,
        startTime: new Date(),
        isRunning: true,
      },
    });

    return timeEntry;
  }

  /** Stop time tracking */
  async stopTimer(timeEntryId: string, freelancerId: string) {
    const timeEntry = await this.prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
      include: {
        contract: true,
      },
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    if (timeEntry.freelancerId !== freelancerId) {
      throw new ForbiddenException('Access denied');
    }

    if (!timeEntry.isRunning) {
      throw new BadRequestException('Timer is not running');
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / 1000 / 60); // minutes

    const updated = await this.prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: {
        endTime,
        duration,
        isRunning: false,
      },
    });

    return updated;
  }

  /** Get time entries for a contract */
  async findByContract(contractId: string, userId: string) {
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

    const timeEntries = await this.prisma.timeEntry.findMany({
      where: { contractId },
      orderBy: { startTime: 'desc' },
    });

    // Calculate total time
    const totalMinutes = timeEntries
      .filter((e) => e.duration !== null)
      .reduce((sum, e) => sum + (e.duration || 0), 0);

    return {
      entries: timeEntries,
      totalMinutes,
      totalHours: Math.floor(totalMinutes / 60),
    };
  }

  /** Get all time entries for a freelancer */
  async findByFreelancer(freelancerId: string) {
    const timeEntries = await this.prisma.timeEntry.findMany({
      where: { freelancerId },
      include: {
        contract: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return timeEntries;
  }

  /** Delete a time entry */
  async delete(timeEntryId: string, freelancerId: string) {
    const timeEntry = await this.prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    if (timeEntry.freelancerId !== freelancerId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.timeEntry.delete({
      where: { id: timeEntryId },
    });

    return { message: 'Time entry deleted' };
  }

  /** Get running timer for a contract */
  async getRunningTimer(contractId: string, freelancerId: string) {
    const timer = await this.prisma.timeEntry.findFirst({
      where: {
        contractId,
        freelancerId,
        isRunning: true,
      },
    });

    return timer;
  }
}


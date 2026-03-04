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
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly notificationsService: NotificationsService,
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

  /** Submit a delivery (freelancer action) */
  async create(contractId: string, freelancerId: string, dto: CreateDeliveryDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.freelancerId !== freelancerId) {
      throw new ForbiddenException('Only the freelancer can submit deliveries');
    }

    if (contract.status !== 'ACTIVE') {
      throw new BadRequestException('Contract is not active');
    }

    // If milestoneId is provided, verify it exists and belongs to contract
    if (dto.milestoneId) {
      const milestone = await this.prisma.milestone.findUnique({
        where: { id: dto.milestoneId },
      });

      if (!milestone || milestone.contractId !== contractId) {
        throw new BadRequestException('Invalid milestone');
      }
    }

    const delivery = await this.prisma.delivery.create({
      data: {
        contractId,
        milestoneId: dto.milestoneId || null,
        freelancerId,
        title: dto.title,
        description: dto.description,
        attachments: dto.attachments || [],
        status: 'SUBMITTED',
      },
      include: {
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Notify client
    await this.notificationsService.createNotification(
      contract.clientId,
      'NEW_DELIVERY',
      `New delivery "${dto.title}" submitted for review`,
      {
        contractId,
        deliveryId: delivery.id,
      },
    );

    return delivery;
  }

  /** Get deliveries for a contract */
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

    const deliveries = await this.prisma.delivery.findMany({
      where: { contractId },
      include: {
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return deliveries;
  }

  /** Approve a delivery (client action) */
  async approve(deliveryId: string, clientId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        contract: true,
        milestone: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.contract.clientId !== clientId) {
      throw new ForbiddenException('Only the client can approve deliveries');
    }

    if (delivery.status !== 'SUBMITTED' && delivery.status !== 'REVISION_REQUESTED') {
      throw new BadRequestException('Delivery cannot be approved in current status');
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
    });

    // If delivery is for a milestone, mark milestone as completed
    if (delivery.milestoneId) {
      await this.prisma.milestone.update({
        where: { id: delivery.milestoneId },
        data: { status: 'COMPLETED' },
      });
    }

    // Notify freelancer
    await this.notificationsService.createNotification(
      delivery.freelancerId,
      'DELIVERY_APPROVED',
      `Your delivery "${delivery.title}" has been approved`,
      {
        contractId: delivery.contractId,
        deliveryId,
      },
    );

    return updated;
  }

  /** Reject a delivery (client action) */
  async reject(deliveryId: string, clientId: string, feedback?: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        contract: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.contract.clientId !== clientId) {
      throw new ForbiddenException('Only the client can reject deliveries');
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'REJECTED',
        clientFeedback: feedback || null,
        reviewedAt: new Date(),
      },
    });

    // Notify freelancer
    await this.notificationsService.createNotification(
      delivery.freelancerId,
      'DELIVERY_REJECTED',
      `Your delivery "${delivery.title}" has been rejected`,
      {
        contractId: delivery.contractId,
        deliveryId,
      },
    );

    return updated;
  }

  /** Request revision (client action) */
  async requestRevision(deliveryId: string, clientId: string, feedback: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        contract: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.contract.clientId !== clientId) {
      throw new ForbiddenException('Only the client can request revisions');
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'REVISION_REQUESTED',
        clientFeedback: feedback,
        reviewedAt: new Date(),
      },
    });

    // Notify freelancer
    await this.notificationsService.createNotification(
      delivery.freelancerId,
      'DELIVERY_REVISION_REQUESTED',
      `Revision requested for delivery "${delivery.title}"`,
      {
        contractId: delivery.contractId,
        deliveryId,
      },
    );

    return updated;
  }

  /** Get a single delivery */
  async findOne(deliveryId: string, userId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        contract: {
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
        },
        milestone: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.contract.clientId !== userId && delivery.contract.freelancerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return delivery;
  }
}


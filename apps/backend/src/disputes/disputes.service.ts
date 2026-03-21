import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private getUserId(auth?: string): string {
    if (!auth?.startsWith('Bearer ')) throw new ForbiddenException('Unauthorized');
    const payload = this.jwt.verify<{ sub: string }>(auth.replace('Bearer ', ''));
    return payload.sub;
  }

  async create(auth: string, dto: CreateDisputeDto) {
    const userId = this.getUserId(auth);

    // Verify user is part of the contract
    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('You are not part of this contract');
    }

    return this.prisma.dispute.create({
      data: {
        contractId: dto.contractId,
        raisedById: userId,
        title: dto.title,
        description: dto.description,
        type: dto.type || 'OTHER',
      },
      include: {
        contract: {
          include: { project: { select: { title: true } } },
        },
        evidence: {
          include: { uploadedBy: { select: { email: true, profile: { select: { name: true } } } } },
        },
      },
    });
  }

  async getMine(auth: string) {
    const userId = this.getUserId(auth);
    return this.prisma.dispute.findMany({
      where: { raisedById: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        contract: {
          include: { project: { select: { title: true } } },
        },
        evidence: {
          include: { uploadedBy: { select: { email: true, profile: { select: { name: true } } } } },
        },
      },
    });
  }

  async getByContract(auth: string, contractId: string) {
    const userId = this.getUserId(auth);
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('You are not part of this contract');
    }
    return this.prisma.dispute.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
      include: {
        raisedBy: { select: { email: true, profile: { select: { name: true } } } },
        evidence: {
          include: { uploadedBy: { select: { email: true, profile: { select: { name: true } } } } },
        },
      },
    });
  }

  async getById(auth: string, id: string) {
    const userId = this.getUserId(auth);
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        contract: true,
        raisedBy: { select: { email: true, profile: { select: { name: true } } } },
        evidence: {
          include: { uploadedBy: { select: { email: true, profile: { select: { name: true } } } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!dispute) throw new NotFoundException('Dispute not found');
    
    // Authorization check
    const isParticipant = dispute.contract.clientId === userId || dispute.contract.freelancerId === userId;
    if (!isParticipant) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') {
        throw new ForbiddenException('You are not part of this dispute');
      }
    }

    return dispute;
  }

  async addEvidence(auth: string, disputeId: string, fileUrl: string, fileName?: string) {
    const userId = this.getUserId(auth);
    await this.getById(auth, disputeId); // Permission check

    return this.prisma.disputeEvidence.create({
      data: {
        disputeId,
        uploadedById: userId,
        fileUrl,
        fileName,
      },
      include: {
        uploadedBy: { select: { email: true, profile: { select: { name: true } } } },
      },
    });
  }
}

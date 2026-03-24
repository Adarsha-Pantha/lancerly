import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAdminExists() {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true },
    });
    return { exists: !!admin, email: admin?.email || null };
  }

  async getDashboardStats() {
    const [users, clients, freelancers, projects, posts, conversations, proposals] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.user.count({ where: { role: 'FREELANCER' } }),
      this.prisma.project.count(),
      this.prisma.post.count(),
      this.prisma.conversation.count(),
      this.prisma.proposal.count(),
    ]);

    return {
      totalUsers: users,
      clients,
      freelancers,
      totalProjects: projects,
      totalPosts: posts,
      totalConversations: conversations,
      totalProposals: proposals,
    };
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          profile: true,
          _count: {
            select: {
              projects: true,
              proposals: true,
              posts: true,
              conversationsAsClient: true,
              conversationsAsFreelancer: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        profile: u.profile,
        stats: {
          projects: u._count.projects,
          proposals: u._count.proposals,
          posts: u._count.posts,
          conversations: u._count.conversationsAsClient + u._count.conversationsAsFreelancer,
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllProjects(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        skip,
        take: limit,
        include: {
          client: {
            include: {
              profile: {
                select: { name: true, avatarUrl: true },
              },
            },
          },
          _count: {
            select: {
              proposals: true,
              conversations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count(),
    ]);

    return {
      projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllPosts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        include: {
          author: {
            include: {
              profile: {
                select: { name: true, avatarUrl: true },
              },
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count(),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllConversations(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        skip,
        take: limit,
        include: {
          client: {
            include: {
              profile: {
                select: { name: true, avatarUrl: true },
              },
            },
          },
          freelancer: {
            include: {
              profile: {
                select: { name: true, avatarUrl: true },
              },
            },
          },
          project: {
            select: { id: true, title: true },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.conversation.count(),
    ]);

    return {
      conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserActivity(userId: string) {
    const [user, projects, posts, proposals, conversations, logins] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      this.prisma.project.findMany({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.proposal.findMany({
        where: { freelancerId: userId },
        include: {
          project: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.conversation.findMany({
        where: {
          OR: [{ clientId: userId }, { freelancerId: userId }],
        },
        include: {
          client: {
            include: {
              profile: { select: { name: true } },
            },
          },
          freelancer: {
            include: {
              profile: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.login.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return {
      user,
      activities: {
        projects,
        posts,
        proposals,
        conversations,
        logins,
      },
    };
  }

  async getPlatformSettings() {
    return this.prisma.platformSettings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton' },
    });
  }

  async updatePlatformSettings(data: { freelancerServiceFee?: number; clientProcessingFee?: number; weeklyProjectLimit?: number }) {
    return this.prisma.platformSettings.update({
      where: { id: 'singleton' },
      data,
    });
  }

  async getFinanceStats() {
    const [paidMilestones, escrowMilestones] = await Promise.all([
      this.prisma.milestone.findMany({
        where: { status: 'PAID' },
        include: { contract: { select: { project: { select: { title: true } } } } },
      }),
      this.prisma.milestone.findMany({
        where: { isFunded: true, status: { not: 'PAID' } },
      }),
    ]);

    const totalVolumeCents = paidMilestones.reduce((acc, m) => acc + m.amount + (m.clientFee || 0), 0);
    const platformRevenueCents = paidMilestones.reduce((acc, m) => acc + (m.clientFee || 0) + (m.freelancerFee || 0), 0);
    const inEscrowCents = escrowMilestones.reduce((acc, m) => acc + m.amount + (m.clientFee || 0), 0);
    
    // Recent transactions (last 10 paid)
    const recentTransactions = paidMilestones
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10)
      .map(m => ({
        id: m.id,
        projectTitle: m.contract.project.title,
        amount: m.amount,
        clientFee: m.clientFee,
        freelancerFee: m.freelancerFee,
        totalCharged: m.amount + m.clientFee,
        platformRevenue: m.clientFee + m.freelancerFee,
        date: m.updatedAt,
      }));

    return {
      totalVolume: totalVolumeCents,
      platformRevenue: platformRevenueCents,
      inEscrow: inEscrowCents,
      recentTransactions,
    };
  }

  async getPendingKyc() {
    return this.prisma.profile.findMany({
      where: { kycStatus: 'PENDING' },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    });
  }

  async approveKyc(userId: string) {
    return this.prisma.profile.update({
      where: { userId },
      data: { kycStatus: 'APPROVED' },
    });
  }

  async rejectKyc(userId: string, reason: string) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        kycStatus: 'REJECTED',
        kycRejectionReason: reason,
      },
    });
  }

  async getAllDisputes(status?: string) {
    return this.prisma.dispute.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        raisedBy: {
          select: {
            email: true,
            role: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
        contract: {
          include: {
            project: { select: { title: true } },
            client: { select: { email: true, profile: { select: { name: true, avatarUrl: true } } } },
            freelancer: { select: { email: true, profile: { select: { name: true, avatarUrl: true } } } },
          },
        },
        evidence: {
          include: {
            uploadedBy: {
              select: {
                email: true,
                profile: { select: { name: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });
  }

  async getSubscribedUsers() {
    return this.prisma.user.findMany({
      where: { isSubscribed: true },
      include: {
        profile: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateDispute(id: string, status: string, adminNotes?: string, resolution?: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: status as any,
        ...(adminNotes !== undefined && { adminNotes }),
        ...(resolution !== undefined && { resolution }),
      },
      include: {
        raisedBy: {
          select: {
            email: true,
            role: true,
            profile: { select: { name: true } },
          },
        },
        contract: {
          include: {
            project: { select: { title: true } },
            client: { select: { email: true, profile: { select: { name: true } } } },
            freelancer: { select: { email: true, profile: { select: { name: true } } } },
          },
        },
        evidence: {
          include: {
            uploadedBy: {
              select: {
                email: true,
                profile: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  }
}


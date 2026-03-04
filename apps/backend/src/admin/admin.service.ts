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
}


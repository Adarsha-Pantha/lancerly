import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

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
        isSuspended: (u as any).isSuspended ?? false,
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
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: { kycStatus: 'APPROVED' },
      include: { user: { select: { email: true } } },
    });
    this.mail.send({ to: profile.user.email, template: 'kyc_approved', data: { name: profile.name ?? 'there' } }).catch(() => null);
    return profile;
  }

  async rejectKyc(userId: string, reason: string) {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        kycStatus: 'REJECTED',
        kycRejectionReason: reason,
      },
      include: { user: { select: { email: true } } },
    });
    this.mail.send({ to: profile.user.email, template: 'kyc_rejected', data: { name: profile.name ?? 'there', reason } }).catch(() => null);
    return profile;
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

  async bulkSuspendUsers(userIds: string[], suspend: boolean) {
    await this.prisma.user.updateMany({
      where: { id: { in: userIds }, role: { not: 'ADMIN' } },
      data: { isSuspended: suspend },
    });
    return { updated: userIds.length, suspend };
  }

  // ── Recent platform activity (replaces the hardcoded activityFeed) ─────────
  async getRecentActivity(limit = 12) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

    const [users, projects, disputes, proposals, contracts] = await Promise.all([
      this.prisma.user.findMany({
        where: { createdAt: { gte: since }, role: { not: 'ADMIN' } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, email: true, role: true, createdAt: true, profile: { select: { name: true } } },
      }),
      this.prisma.project.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, createdAt: true },
      }),
      this.prisma.dispute.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, createdAt: true, status: true,
          raisedBy: { select: { profile: { select: { name: true } } } },
          contract: { select: { project: { select: { title: true } } } },
        },
      }),
      this.prisma.proposal.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, createdAt: true,
          project: { select: { title: true } },
          freelancer: { select: { profile: { select: { name: true } } } },
        },
      }),
      this.prisma.contract.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, createdAt: true,
          project: { select: { title: true } },
          client: { select: { profile: { select: { name: true } } } },
          freelancer: { select: { profile: { select: { name: true } } } },
        },
      }),
    ]);

    const events: { text: string; time: Date; type: string }[] = [
      ...users.map(u => ({
        text: `New ${u.role.toLowerCase()} ${u.profile?.name ?? u.email} registered`,
        time: u.createdAt,
        type: 'user',
      })),
      ...projects.map(p => ({
        text: `New project posted: "${p.title}"`,
        time: p.createdAt,
        type: 'project',
      })),
      ...disputes.map(d => ({
        text: `Dispute opened by ${d.raisedBy.profile?.name ?? 'a user'} on "${d.contract.project.title}"`,
        time: d.createdAt,
        type: 'dispute',
      })),
      ...proposals.map(p => ({
        text: `${p.freelancer.profile?.name ?? 'A freelancer'} submitted a proposal for "${p.project.title}"`,
        time: p.createdAt,
        type: 'proposal',
      })),
      ...contracts.map(c => ({
        text: `Contract started between ${c.client.profile?.name ?? 'client'} & ${c.freelancer.profile?.name ?? 'freelancer'} for "${c.project.title}"`,
        time: c.createdAt,
        type: 'contract',
      })),
    ];

    events.sort((a, b) => b.time.getTime() - a.time.getTime());

    return events.slice(0, limit).map(e => ({
      text: e.text,
      time: e.time,
      type: e.type,
    }));
  }

  // ── Project counts grouped by top skills (replaces hardcoded categories) ──
  async getCategoryStats() {
    const projects = await this.prisma.project.findMany({
      select: { skills: true, status: true },
    });

    const skillGroups: Record<string, { label: string; keywords: string[]; color: string; icon: string }> = {
      'Web Development': { label: 'Web Development', keywords: ['react', 'vue', 'angular', 'node', 'javascript', 'typescript', 'html', 'css', 'next', 'web'], color: '#2563eb', icon: '💻' },
      'UI/UX Design':    { label: 'UI/UX Design',    keywords: ['figma', 'ux', 'ui', 'design', 'sketch', 'adobe', 'prototyping', 'wireframe'],                  color: '#7c3aed', icon: '🎨' },
      'Mobile Dev':      { label: 'Mobile Dev',       keywords: ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios', 'mobile'],                      color: '#059669', icon: '📱' },
      'AI / ML':         { label: 'AI / ML',          keywords: ['python', 'tensorflow', 'pytorch', 'machine learning', 'ai', 'ml', 'nlp', 'llm', 'data'],       color: '#d97706', icon: '🤖' },
      'Content Writing': { label: 'Content Writing',  keywords: ['writing', 'copywriting', 'seo', 'content', 'blog', 'technical writing'],                        color: '#db2777', icon: '✍️' },
      'Marketing':       { label: 'Marketing',        keywords: ['marketing', 'social media', 'google ads', 'analytics', 'email marketing', 'seo'],               color: '#0891b2', icon: '📣' },
    };

    const counts: Record<string, number> = {};
    const skillSets: Record<string, Set<string>> = {};

    for (const [key] of Object.entries(skillGroups)) {
      counts[key] = 0;
      skillSets[key] = new Set();
    }

    for (const project of projects) {
      const normalised = project.skills.map(s => s.toLowerCase());
      for (const [key, group] of Object.entries(skillGroups)) {
        if (normalised.some(s => group.keywords.some(k => s.includes(k)))) {
          counts[key]++;
          normalised.forEach(s => skillSets[key].add(s));
        }
      }
    }

    const total = Math.max(...Object.values(counts), 1);

    return Object.entries(skillGroups).map(([key, group]) => ({
      name: group.label,
      projects: counts[key],
      color: group.color,
      icon: group.icon,
      skills: Array.from(skillSets[key]).slice(0, 8),
    }));
  }

  // ── Badge counts for nav (pending users without profile, open disputes) ────
  async getNavBadges() {
    const [pendingKyc, openDisputes] = await Promise.all([
      this.prisma.profile.count({ where: { kycStatus: 'PENDING' } }),
      this.prisma.dispute.count({ where: { status: 'OPEN' } }),
    ]);
    return { pendingKyc, openDisputes };
  }

  // ── Platform trust stats (replaces landing page hardcoded numbers) ─────────
  async getPlatformTrustStats() {
    const [totalFreelancers, totalProjects, totalContractValue] = await Promise.all([
      this.prisma.user.count({ where: { role: 'FREELANCER' } }),
      this.prisma.project.count(),
      this.prisma.milestone.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    ]);

    const totalValueDollars = Math.floor((totalContractValue._sum.amount ?? 0) / 100);
    return {
      totalFreelancers,
      totalProjects,
      totalValueDollars,
    };
  }
}


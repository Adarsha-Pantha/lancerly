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
import { CreateConversationDto, SendMessageDto } from './dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /** Extract userId from "Authorization: Bearer <token>" header */
  async userIdFromAuth(auth?: string) {
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.slice(7);
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      if (!payload?.sub) throw new UnauthorizedException('Invalid token');
      return payload.sub;
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired. Please log in again.');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /** Get all conversations for a user */
  async findAll(userId: string) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          OR: [
            { clientId: userId },
            { freelancerId: userId },
          ],
        },
        select: {
          id: true,
          projectId: true,
          clientId: true,
          freelancerId: true,
          clientLastReadAt: true,
          freelancerLastReadAt: true,
          createdAt: true,
          updatedAt: true,
          client: {
            select: {
              id: true,
              profile: {
                select: {
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          freelancer: {
            select: {
              id: true,
              profile: {
                select: {
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Order by creation date for now
        },
      });

      return conversations.map(conv => {
        const isClient = userId === conv.clientId;
        const otherUser = isClient ? conv.freelancer : conv.client;
        const lastReadAt = isClient ? conv.clientLastReadAt : conv.freelancerLastReadAt;
        const lastMessage = conv.messages && conv.messages[0] ? conv.messages[0] : null;
        const hasUnread = !!(
          lastMessage &&
          lastMessage.createdAt &&
          lastMessage.createdAt > lastReadAt &&
          lastMessage.senderId !== userId
        );
        
        if (!otherUser) {
          // Handle edge case where relation might be missing
          return null;
        }

        return {
          id: conv.id,
          projectId: conv.projectId,
          project: conv.project,
          participant: {
            id: otherUser.id,
            name: otherUser.profile?.name || 'Unknown',
            avatarUrl: otherUser.profile?.avatarUrl || null,
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
          } : null,
          hasUnread,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt || conv.createdAt,
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error in findAll conversations:', error);
      throw error;
    }
  }

  /**
   * Ensure there is a direct (non-project) conversation between two users.
   * Returns the conversation id.
   */
  async ensureDirectConversation(clientId: string, freelancerId: string) {
    if (clientId === freelancerId) {
      throw new BadRequestException('Invalid participants');
    }

    const existing = await this.prisma.conversation.findFirst({
      where: {
        projectId: null,
        OR: [
          { clientId, freelancerId },
          { clientId: freelancerId, freelancerId: clientId },
        ],
      },
    });

    if (existing) {
      return existing.id;
    }

    const created = await this.prisma.conversation.create({
      data: {
        clientId,
        freelancerId,
        projectId: null,
      },
    });

    return created.id;
  }

  /** Get a single conversation with messages */
  async findOne(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
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
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.clientId !== userId && conversation.freelancerId !== userId) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    // Mark conversation as read for this user when they open it
    const now = new Date();
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data:
        conversation.clientId === userId
          ? { clientLastReadAt: now }
          : { freelancerLastReadAt: now },
    });

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
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
      orderBy: { createdAt: 'asc' },
    });

    const isClient = userId === conversation.clientId;
    const otherUser = isClient ? conversation.freelancer : conversation.client;
    
    if (!otherUser) {
      throw new NotFoundException('Participant not found in conversation');
    }

    return {
      id: conversation.id,
      projectId: conversation.projectId,
      project: conversation.project,
      participant: {
        id: otherUser.id,
        name: otherUser.profile?.name || 'Unknown',
        avatarUrl: otherUser.profile?.avatarUrl || null,
      },
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        sender: {
          id: msg.sender?.id || msg.senderId,
          name: msg.sender?.profile?.name || 'Unknown',
          avatarUrl: msg.sender?.profile?.avatarUrl || null,
        },
        createdAt: msg.createdAt,
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt || conversation.createdAt,
    };
  }

  /** Create a new conversation */
  async create(userId: string, dto: CreateConversationDto) {
    if (dto.freelancerId === userId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Verify freelancer exists
    const freelancer = await this.prisma.user.findUnique({
      where: { id: dto.freelancerId },
      select: { id: true, role: true },
    });

    if (!freelancer) {
      throw new NotFoundException('Freelancer not found');
    }

    // If projectId is provided, verify it exists and user has access
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      if (project.clientId !== userId) {
        throw new ForbiddenException('Access denied to this project');
      }
    }

    // Check if conversation already exists
    const existing = await this.prisma.conversation.findFirst({
      where: {
        clientId: userId,
        freelancerId: dto.freelancerId,
        projectId: dto.projectId || null,
      },
    });

    if (existing) {
      return this.findOne(existing.id, userId);
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        clientId: userId,
        freelancerId: dto.freelancerId,
        projectId: dto.projectId || null,
      },
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
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!conversation.freelancer) {
      throw new NotFoundException('Freelancer not found');
    }

    return {
      id: conversation.id,
      projectId: conversation.projectId,
      project: conversation.project,
      participant: {
        id: conversation.freelancer.id,
        name: conversation.freelancer.profile?.name || 'Unknown',
        avatarUrl: conversation.freelancer.profile?.avatarUrl || null,
      },
      messages: [],
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt || conversation.createdAt,
    };
  }

  /** Send a message in a conversation */
  async sendMessage(conversationId: string, userId: string, dto: SendMessageDto) {
    // Verify conversation exists and user has access
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.clientId !== userId && conversation.freelancerId !== userId) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const now = new Date();

    // Create message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: dto.content,
        createdAt: now,
      },
      include: {
        sender: {
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

    // Update sender's lastReadAt so the conversation isn't marked unread for themselves
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data:
        conversation.clientId === userId
          ? { clientLastReadAt: now }
          : { freelancerLastReadAt: now },
    });

    // Note: Conversation's updatedAt will be set on conversation updates
    // Determine recipient and send notification
    const recipientId =
      conversation.clientId === userId
        ? conversation.freelancerId
        : conversation.clientId;

    await this.notificationsService.createNotification(
      recipientId,
      'NEW_MESSAGE',
      `You have a new message from ${message.sender.profile?.name || 'a user'}`,
      {
        conversationId,
        senderId: userId,
      },
    );

    // For sorting by last activity, we can use the last message's createdAt

    if (!message.sender) {
      throw new NotFoundException('Sender not found');
    }

    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      sender: {
        id: message.sender.id,
        name: message.sender.profile?.name || 'Unknown',
        avatarUrl: message.sender.profile?.avatarUrl || null,
      },
      createdAt: message.createdAt,
    };
  }
}


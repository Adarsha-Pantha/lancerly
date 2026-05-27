import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ModerationService } from '../common/moderation/moderation.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly moderationService: ModerationService,
  ) {}

  /** Extract userId from "Authorization: Bearer <token>" header */
  async userIdFromAuth(auth?: string) {
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.slice(7);
    const payload = await this.jwt.verifyAsync<{ sub: string }>(token).catch(() => null);
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');

    // Ensure the referenced user actually exists (prevents FK errors later)
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');

    return payload.sub;
  }

  /** Create a new post */
  async create(userId: string, dto: CreatePostDto) {
    // Ensure the author (user) exists to avoid foreign key violations
    const author = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!author) {
      throw new NotFoundException('Author (user) not found');
    }

    // Content moderation
    const contentToCheck = dto.content ?? '';
    let moderationStatus: string = 'APPROVED';
    let moderationNotes: string | null = null;
    if (contentToCheck.trim()) {
      const mod = await this.moderationService.analyzeContent(contentToCheck);
      moderationStatus = mod.status;
      moderationNotes = mod.notes;
      if (mod.status === 'BLOCKED') {
        throw new Error('Post blocked: ' + (mod.notes ?? 'Content policy violation'));
      }
    }

    const post = await this.prisma.post.create({
      data: {
        author: { connect: { id: userId } },
        content: dto.content || null,
        mediaUrls: dto.mediaUrls || [],
        moderationStatus: moderationStatus as any,
        moderationNotes,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return post;
  }

  /** Get all posts (feed) - requires authenticated user */
  async findAll(userId: string) {
    const posts = await this.prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId,
          },
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined,
    }));
  }

  /** Like or unlike a post */
  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      return { liked: false };
    } else {
      // Like
      await this.prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
      return { liked: true };
    }
  }

  /** Delete a post */
  async remove(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }

  /** Get comments for a post */
  async getComments(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.postComment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Add a comment to a post */
  async addComment(userId: string, postId: string, content: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.postComment.create({
      data: { postId, authorId: userId, content },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });
  }
}


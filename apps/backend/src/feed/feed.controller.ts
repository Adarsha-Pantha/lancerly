import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import type { Multer } from 'multer';
import { FeedService } from './feed.service';

const mediaStorage = diskStorage({
  destination: 'uploads',
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  },
});

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /** Extract userId from auth header - requires authentication */
  private async getUserId(req: Request): Promise<string> {
    return await this.feedService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('media', 10, {
      storage: mediaStorage,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    }),
  )
  async create(
    @Req() req: Request,
    @UploadedFiles() files: Multer.File[] = [],
  ) {
    try {
      const userId = await this.feedService.userIdFromAuth(
        req.headers['authorization'] as string | undefined,
      );
      // Extract content from form data (multipart/form-data)
      // Multer parses form fields into req.body
      const contentValue = req.body?.content;
      const content = contentValue && String(contentValue).trim() 
        ? String(contentValue).trim() 
        : undefined;
      const mediaUrls = files && Array.isArray(files) 
        ? files.map((file) => `/uploads/${file.filename}`) 
        : [];
      
      // Validate that we have at least content or media
      if (!content && mediaUrls.length === 0) {
        throw new BadRequestException('Post must have content or media');
      }
      
      return this.feedService.create(userId, { content, mediaUrls });
    } catch (error: any) {
      // Re-throw NestJS exceptions as-is, wrap others
      if (error.status && error.message) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to create post');
    }
  }

  @Get()
  async findAll(@Req() req: Request) {
    // Require authentication to view feed
    const userId = await this.getUserId(req);
    return this.feedService.findAll(userId);
  }

  @Post(':id/like')
  async toggleLike(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.feedService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
    return this.feedService.toggleLike(userId, id);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.feedService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
    return this.feedService.remove(userId, id);
  }
}


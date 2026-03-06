// apps/backend/src/profile/profile.controller.ts
import {
  Controller, Get, Put, Body, Req, Param, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProfileService } from './profile.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly svc: ProfileService) {}

  @Get('me')
  me(@Req() req: Request) {
    return this.svc.getMine(req.headers['authorization'] as string | undefined);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: Request) {
    try {
      return await this.svc.getById(id, req.headers['authorization'] as string | undefined);
    } catch (error: any) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  @Put()
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: 'uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  update(
    @Req() req: Request,
    @Body() dto: CompleteProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.svc.updateMine(req.headers['authorization'], dto, avatarUrl);
  }
}

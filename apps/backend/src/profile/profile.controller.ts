// apps/backend/src/profile/profile.controller.ts
import {
  Controller, Get, Put, Body, Req, Param, UseInterceptors, UploadedFile, Post, UploadedFiles,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
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

  @Post('verify-identity')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: 'uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'kyc-' + unique + extname(file.originalname));
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async updateKyc(
    @Req() req: Request,
    @UploadedFiles() files: { front?: Express.Multer.File[], back?: Express.Multer.File[] },
  ) {
    const frontUrl = files.front?.[0] ? `/uploads/${files.front[0].filename}` : undefined;
    const backUrl = files.back?.[0] ? `/uploads/${files.back[0].filename}` : undefined;
    return this.svc.updateKyc(req.headers['authorization'], frontUrl, backUrl);
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

  @Post('portfolio')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: 'uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'portfolio-' + unique + extname(file.originalname));
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async addPortfolioProject(
    @Req() req: Request,
    @Body() dto: { title: string; description: string; skills: string; liveLink?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    const authHeader = req.headers['authorization'];
    return this.svc.addPortfolioProject(authHeader as string, dto, imageUrl);
  }
}

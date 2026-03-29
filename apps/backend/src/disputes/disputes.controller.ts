import {
  Controller, Post, Get, Body, Req, Param, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Controller('disputes')
export class DisputesController {
  constructor(private readonly svc: DisputesService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDisputeDto) {
    return this.svc.create(req.headers['authorization'] as string, dto);
  }

  @Get('me')
  getMine(@Req() req: Request) {
    return this.svc.getMine(req.headers['authorization'] as string);
  }

  @Get('contract/:contractId')
  getByContract(@Req() req: Request, @Param('contractId') contractId: string) {
    return this.svc.getByContract(req.headers['authorization'] as string, contractId);
  }

  @Get(':id')
  getById(@Req() req: Request, @Param('id') id: string) {
    return this.svc.getById(req.headers['authorization'] as string, id);
  }

  @Post(':id/evidence')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: 'uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'evidence-' + unique + extname(file.originalname));
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  addEvidence(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = `/uploads/${file.filename}`;
    return this.svc.addEvidence(req.headers['authorization'] as string, id, fileUrl, file.originalname);
  }
}

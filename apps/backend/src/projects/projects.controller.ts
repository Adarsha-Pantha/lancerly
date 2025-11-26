import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import type { Multer } from 'multer';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const attachmentStorage = diskStorage({
  destination: 'uploads',
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  },
});

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /** Extract userId from auth header */
  private async getUserId(req: Request): Promise<string> {
    return this.projectsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateProjectDto) {
    const clientId = await this.getUserId(req);
    return this.projectsService.create(clientId, dto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('skills') skills?: string,
    @Query('clientId') clientId?: string,
    @Query('type') type?: 'CLIENT_REQUEST' | 'FREELANCER_SHOWCASE',
  ) {
    const skillsArray = skills ? skills.split(',') : undefined;
    return this.projectsService.findAll({
      status,
      keyword,
      skills: skillsArray,
      clientId,
      type,
    });
  }

  @Get('me')
  async findMyProjects(@Req() req: Request) {
    const clientId = await this.getUserId(req);
    return this.projectsService.findMyProjects(clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const userId = await this.getUserId(req);
    return this.projectsService.update(userId, id, dto);
  }

  @Patch(':id/archive')
  async archive(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.getUserId(req);
    return this.projectsService.archive(userId, id);
  }

  @Patch(':id/status')
  async changeStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const userId = await this.getUserId(req);
    return this.projectsService.changeStatus(userId, id, status);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: attachmentStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadAssets(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFiles() files: Multer.File[] = [],
  ) {
    const userId = await this.getUserId(req);
    const assetUrls = files.map((file) => `/uploads/${file.filename}`);
    return this.projectsService.addAttachments(userId, id, assetUrls);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.getUserId(req);
    return this.projectsService.remove(userId, id);
  }
}


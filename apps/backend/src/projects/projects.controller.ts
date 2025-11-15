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
} from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

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
  ) {
    const skillsArray = skills ? skills.split(',') : undefined;
    return this.projectsService.findAll({
      status,
      keyword,
      skills: skillsArray,
      clientId,
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

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.getUserId(req);
    return this.projectsService.remove(userId, id);
  }
}


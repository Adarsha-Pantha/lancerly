import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  private async getUserId(req: Request): Promise<string> {
    return this.proposalsService.userIdFromAuth(
      req.headers['authorization'] as string | undefined,
    );
  }

  /** Generate a proposal draft with Groq (Llama 3.1 — free) */
  @Post('generate-draft')
  async generateDraft(@Body() dto: GenerateDraftDto) {
    return this.proposalsService.generateProposalDraft(dto);
  }

  /** Submit a proposal for a project */
  @Post('project/:projectId')
  async create(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Body() dto: CreateProposalDto,
  ) {
    const freelancerId = await this.getUserId(req);
    return this.proposalsService.create(freelancerId, projectId, dto);
  }

  /** Get all proposals for a project (client view) */
  @Get('project/:projectId')
  async findByProject(@Req() req: Request, @Param('projectId') projectId: string) {
    const clientId = await this.getUserId(req);
    return this.proposalsService.findByProject(projectId, clientId);
  }

  /** Get proposals submitted by current freelancer */
  @Get('me')
  async findMyProposals(@Req() req: Request) {
    const freelancerId = await this.getUserId(req);
    return this.proposalsService.findByFreelancer(freelancerId);
  }

  /** Get a single proposal */
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = await this.getUserId(req);
    return this.proposalsService.findOne(id, userId);
  }

  /** Accept a proposal (award contract) */
  @Patch(':id/accept')
  async accept(@Req() req: Request, @Param('id') id: string) {
    const clientId = await this.getUserId(req);
    return this.proposalsService.accept(id, clientId);
  }

  /** Reject a proposal */
  @Patch(':id/reject')
  async reject(@Req() req: Request, @Param('id') id: string) {
    const clientId = await this.getUserId(req);
    return this.proposalsService.reject(id, clientId);
  }
}


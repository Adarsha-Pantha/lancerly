import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('refine-brief')
  async refineBrief(
    @Body('title') title: string,
    @Body('description') description: string,
  ) {
    if (!title || !description) {
      throw new BadRequestException('Title and description are required');
    }

    const refinement = await this.aiService.refineBrief(title, description);

    if (!refinement) {
      throw new BadRequestException('Failed to refine brief. Please try again later.');
    }

    return refinement;
  }
}

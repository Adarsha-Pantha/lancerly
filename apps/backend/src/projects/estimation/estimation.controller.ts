import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EstimationService } from './estimation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('projects/estimate')
export class EstimationController {
  constructor(private readonly estimationService: EstimationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async getEstimate(
    @Body() data: { title: string; description: string; skills: string[] },
  ) {
    return this.estimationService.getEstimate(data);
  }
}

import { Module } from '@nestjs/common';
import { EstimationController } from './estimation.controller';
import { EstimationService } from './estimation.service';
import { PrismaModule } from '../../prisma/prisma.module';

import { ModerationModule } from '../../common/moderation/moderation.module';

@Module({
  imports: [PrismaModule, ModerationModule],
  controllers: [EstimationController],
  providers: [EstimationService],
  exports: [EstimationService],
})
export class EstimationModule {}

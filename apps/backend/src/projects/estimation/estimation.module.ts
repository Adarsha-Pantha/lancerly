import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EstimationController } from './estimation.controller';
import { EstimationService } from './estimation.service';
import { PrismaModule } from '../../prisma/prisma.module';

import { ModerationModule } from '../../common/moderation/moderation.module';

@Module({
  imports: [ConfigModule, PrismaModule, ModerationModule],
  controllers: [EstimationController],
  providers: [EstimationService],
  exports: [EstimationService],
})
export class EstimationModule {}

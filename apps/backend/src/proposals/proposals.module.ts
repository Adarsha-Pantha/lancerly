import { Module } from '@nestjs/common';
import { ModerationModule } from '../common/moderation/moderation.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    NotificationsModule,
    ConversationsModule,
    ModerationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
  ],
  controllers: [ProposalsController],
  providers: [ProposalsService, ConfigService],
  exports: [ProposalsService],
})
export class ProposalsModule {}


import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { FeedModule } from './feed/feed.module';
import { SettingsModule } from './settings/settings.module';
import { ConversationsModule } from './conversations/conversations.module';
import { FriendsModule } from './friends/friends.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { ProposalsModule } from './proposals/proposals.module';
import { ContractsModule } from './contracts/contracts.module';
import { PrismaModule } from './prisma/prisma.module';
import { EstimationModule } from './projects/estimation/estimation.module';
import { ModerationModule } from './common/moderation/moderation.module';
import { DisputesModule } from './disputes/disputes.module';
import { AiModule } from './ai/ai.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserActivityMiddleware } from './common/middleware/user-activity.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    ProjectsModule,
    ProposalsModule,
    ContractsModule,
    FeedModule,
    SettingsModule,
    ConversationsModule,
    FriendsModule,
    NotificationsModule,
    AdminModule,
    StripeModule,
    EstimationModule,
    ModerationModule,
    DisputesModule,
    AiModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserActivityMiddleware)
      .forRoutes('*');
  }
}

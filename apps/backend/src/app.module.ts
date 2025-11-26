import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { FeedModule } from './feed/feed.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, ProfileModule, ProjectsModule, FeedModule, SettingsModule],
})
export class AppModule {}

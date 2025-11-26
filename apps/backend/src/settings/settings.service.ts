// apps/backend/src/settings/settings.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePasswordDto, UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async userIdFromAuth(auth?: string) {
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.slice(7);
    const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');
    return payload.sub;
  }

  async updatePassword(auth: string | undefined, dto: UpdatePasswordDto) {
    const userId = await this.userIdFromAuth(auth);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHash },
    });

    return { message: 'Password updated successfully' };
  }

  async updateSettings(auth: string | undefined, dto: UpdateSettingsDto) {
    const userId = await this.userIdFromAuth(auth);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    // Update user-level settings
    if (dto.twoFA !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFA: dto.twoFA },
      });
    }

    // Update profile-level settings
    const profileUpdate: any = {};
    if (dto.availability !== undefined) {
      profileUpdate.availability = dto.availability;
    }

    if (Object.keys(profileUpdate).length > 0) {
      await this.prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          name: '',
          availability: dto.availability ?? true,
        },
        update: profileUpdate,
      });
    }

    return {
      message: 'Settings updated successfully',
      settings: {
        twoFA: dto.twoFA,
        availability: dto.availability,
        emailNotifications: dto.emailNotifications,
        profileVisibility: dto.profileVisibility,
      },
    };
  }

  async getSettings(auth: string | undefined) {
    const userId = await this.userIdFromAuth(auth);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFA: true,
        profile: {
          select: {
            availability: true,
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return {
      twoFA: user.twoFA,
      availability: user.profile?.availability ?? true,
      emailNotifications: true, // Default for now
      profileVisibility: true, // Default for now
    };
  }
}


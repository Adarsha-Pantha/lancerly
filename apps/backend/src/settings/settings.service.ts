import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdatePasswordDto,
  UpdateSettingsDto,
} from './dto/update-settings.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

const BCRYPT_ROUNDS = 10;
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const AVATAR_SUBDIR = 'avatars';
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GET SETTINGS ─────────────────────────────────────────────────────────
  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        twoFA: true,
        emailNotifications: true,
        profileVisibility: true,
        pendingEmail: true,
        profile: {
          select: {
            name: true,
            headline: true,
            bio: true,
            skills: true,
            timezone: true,
            country: true,
            city: true,
            state: true,
            availability: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const availability = user.profile?.availability ?? true;
    return {
      email: user.email,
      twoFA: user.twoFA,
      emailNotifications: user.emailNotifications,
      profileVisibility: user.profileVisibility,
      availability,
      pendingEmail: user.pendingEmail ?? null,
      profile: {
        name: user.profile?.name ?? '',
        headline: user.profile?.headline ?? null,
        bio: user.profile?.bio ?? null,
        skills: user.profile?.skills ?? [],
        timezone: user.profile?.timezone ?? null,
        country: user.profile?.country ?? null,
        city: user.profile?.city ?? null,
        state: user.profile?.state ?? null,
        availability,
        avatarUrl: user.profile?.avatarUrl ?? null,
      },
    };
  }

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profileData: Record<string, unknown> = {};
    if (dto.name !== undefined) profileData.name = dto.name;
    if (dto.headline !== undefined) profileData.headline = dto.headline;
    if (dto.bio !== undefined) profileData.bio = dto.bio;
    if (dto.skills !== undefined) profileData.skills = dto.skills;
    if (dto.timezone !== undefined) profileData.timezone = dto.timezone;
    if (dto.country !== undefined) profileData.country = dto.country;
    if (dto.city !== undefined) profileData.city = dto.city;
    if (dto.state !== undefined) profileData.state = dto.state;

    if (Object.keys(profileData).length === 0) {
      return { message: 'No profile fields to update', profile: {} };
    }

    const updated = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        name: (dto.name as string) ?? '',
        headline: dto.headline,
        bio: dto.bio,
        skills: dto.skills ?? [],
        timezone: dto.timezone,
        country: dto.country,
        city: dto.city,
        state: dto.state,
        availability: true,
      },
      update: profileData,
      select: {
        name: true,
        headline: true,
        bio: true,
        skills: true,
        timezone: true,
        country: true,
        city: true,
        state: true,
      },
    });

    return { message: 'Profile updated successfully', profile: updated };
  }

  // ─── CHANGE PASSWORD ──────────────────────────────────────────────────────
  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        'New password must differ from current password',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHash },
    });

    return { message: 'Password updated successfully' };
  }

  // ─── REQUEST EMAIL CHANGE (verification structure) ──────────────────────────
  async requestEmailChange(userId: string, dto: UpdateEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.newEmail.toLowerCase() === user.email.toLowerCase()) {
      throw new BadRequestException('New email is the same as current email');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.newEmail.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('This email is already in use');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new BadRequestException('Password is incorrect');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: dto.newEmail.toLowerCase(),
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt,
      },
    });

    // TODO: Send verification email with link containing token
    // For now, return token in dev (remove in production)
    return {
      message:
        'Verification email sent. Check your inbox to confirm the new email.',
      // Dev only: { verificationToken: token }
    };
  }

  // ─── VERIFY NEW EMAIL ────────────────────────────────────────────────────
  async verifyEmail(userId: string, dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        pendingEmail: true,
        emailVerificationToken: true,
        emailVerificationExpires: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.pendingEmail || !user.emailVerificationToken) {
      throw new BadRequestException('No pending email change found');
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          pendingEmail: null,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
      throw new BadRequestException('Verification link has expired');
    }

    if (user.emailVerificationToken !== dto.token) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: user.pendingEmail,
        pendingEmail: null,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return {
      message: 'Email updated successfully',
      email: user.pendingEmail,
    };
  }

  // ─── UPDATE NOTIFICATION & PRIVACY SETTINGS ────────────────────────────────
  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userUpdate: Record<string, boolean> = {};
    if (dto.twoFA !== undefined) userUpdate.twoFA = dto.twoFA;
    if (dto.emailNotifications !== undefined)
      userUpdate.emailNotifications = dto.emailNotifications;
    if (dto.profileVisibility !== undefined)
      userUpdate.profileVisibility = dto.profileVisibility;

    const profileUpdate: Record<string, boolean> = {};
    if (dto.availability !== undefined)
      profileUpdate.availability = dto.availability;

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdate,
        });
      }

      if (Object.keys(profileUpdate).length > 0) {
        await tx.profile.upsert({
          where: { userId },
          create: {
            userId,
            name: '',
            availability: dto.availability ?? true,
          },
          update: profileUpdate,
        });
      }
    });

    return {
      message: 'Settings updated successfully',
      settings: {
        twoFA: dto.twoFA,
        emailNotifications: dto.emailNotifications,
        profileVisibility: dto.profileVisibility,
        availability: dto.availability,
      },
    };
  }

  // ─── UPLOAD AVATAR ───────────────────────────────────────────────────────
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, GIF, WebP',
      );
    }

    if (file.size > MAX_AVATAR_SIZE) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    const dir = path.join(UPLOAD_DIR, AVATAR_SUBDIR);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(
      ext.toLowerCase(),
    )
      ? ext
      : '.jpg';
    const filename = `${userId}-${Date.now()}${safeExt}`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, file.buffer);

    const avatarUrl = `/uploads/${AVATAR_SUBDIR}/${filename}`;

    await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        name: '',
        avatarUrl,
        availability: true,
      },
      update: { avatarUrl },
    });

    return {
      message: 'Profile image updated successfully',
      avatarUrl,
    };
  }

  // ─── DELETE ACCOUNT ──────────────────────────────────────────────────────
  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    if (dto.confirmation !== 'DELETE') {
      throw new BadRequestException(
        'You must type DELETE to confirm account deletion',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new BadRequestException('Password is incorrect');
    }

    // Soft delete: anonymize and mark as deleted (keeps referential integrity)
    await this.prisma.$transaction(async (tx) => {
      await tx.profile.updateMany({
        where: { userId },
        data: { name: 'Deleted User', avatarUrl: null, bio: null },
      });
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@deleted.local`,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), BCRYPT_ROUNDS),
          deletedAt: new Date(),
        },
      });
    });

    return {
      message: 'Account deleted successfully',
    };
  }
}

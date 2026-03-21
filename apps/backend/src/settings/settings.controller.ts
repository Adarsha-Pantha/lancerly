import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SettingsService } from './settings.service';
import {
  UpdatePasswordDto,
  UpdateSettingsDto,
} from './dto/update-settings.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const avatarUpload = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_: unknown, file: Express.Multer.File, cb: (e: Error | null, accept: boolean) => void) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
};

const documentUpload = {
  storage: memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_: unknown, file: Express.Multer.File, cb: (e: Error | null, accept: boolean) => void) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip', 'text/plain', 'application/octet-stream'
    ];
    cb(null, allowed.includes(file.mimetype));
  },
};

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@CurrentUser('userId') userId: string) {
    return this.settingsService.getSettings(userId);
  }

  @Put('profile')
  updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.settingsService.updateProfile(userId, dto);
  }

  @Put('password')
  updatePassword(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.settingsService.updatePassword(userId, dto);
  }

  @Put('email')
  requestEmailChange(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateEmailDto,
  ) {
    return this.settingsService.requestEmailChange(userId, dto);
  }

  @Post('email/verify')
  verifyEmail(
    @CurrentUser('userId') userId: string,
    @Body() dto: VerifyEmailDto,
  ) {
    return this.settingsService.verifyEmail(userId, dto);
  }

  @Put()
  updateSettings(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(userId, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarUpload))
  uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.settingsService.uploadAvatar(userId, file);
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('document', documentUpload))
  uploadDocument(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.settingsService.uploadDocument(userId, file);
  }

  @Delete('account')
  deleteAccount(
    @CurrentUser('userId') userId: string,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.settingsService.deleteAccount(userId, dto);
  }
}

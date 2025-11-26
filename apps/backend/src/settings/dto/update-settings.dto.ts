// apps/backend/src/settings/dto/update-settings.dto.ts
import { IsOptional, IsBoolean, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  twoFA?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  profileVisibility?: boolean;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;
}


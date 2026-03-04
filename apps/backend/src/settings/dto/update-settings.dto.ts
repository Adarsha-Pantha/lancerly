import {
  IsOptional,
  IsBoolean,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

/** Minimum password length for security (marketplace standard) */
export const PASSWORD_MIN_LENGTH = 8;

/** Password must contain at least one letter and one number */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export class UpdatePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Current password is required' })
  currentPassword: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `New password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(PASSWORD_PATTERN, {
    message: 'Password must contain at least one letter and one number',
  })
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

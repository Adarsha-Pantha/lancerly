// apps/backend/src/auth/dto.ts
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RoleDto {
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
}

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsEnum(RoleDto)
  role?: 'CLIENT' | 'FREELANCER';
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

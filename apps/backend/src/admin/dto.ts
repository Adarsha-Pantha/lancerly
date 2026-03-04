import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminRegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class AdminLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}


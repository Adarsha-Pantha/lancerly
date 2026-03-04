import { IsEmail, IsString, MinLength } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  newEmail: string;

  @IsString()
  @MinLength(1, { message: 'Current password is required to change email' })
  password: string;
}

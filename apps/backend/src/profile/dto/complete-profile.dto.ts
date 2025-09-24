import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class CompleteProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsDateString() dob?: string;          // yyyy-mm-dd
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() @Length(2, 20) postalCode?: string;
}

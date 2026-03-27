import { IsOptional, IsString, IsArray, MaxLength, MinLength, IsInt, Min, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Headline must not exceed 200 characters' })
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Bio must not exceed 2000 characters' })
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64, { message: 'Timezone must be a valid IANA timezone (e.g. America/New_York)' })
  timezone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;
}

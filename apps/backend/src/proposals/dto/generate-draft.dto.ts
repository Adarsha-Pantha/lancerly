import { IsOptional, IsString, IsArray } from 'class-validator';

export class GenerateDraftDto {
  @IsString()
  projectTitle: string;

  @IsOptional()
  @IsString()
  projectDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  existingText?: string;
}

import { IsString, IsOptional, IsInt, IsArray, Min, Max, Length } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @Length(3, 200)
  title: string;

  @IsString()
  @Length(10, 5000)
  description: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  screeningQuestions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptanceCriteria?: string[];
}


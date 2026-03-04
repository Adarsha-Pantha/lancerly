import { IsString, IsOptional, IsArray, Length } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @Length(3, 200)
  title!: string;

  @IsString()
  @Length(10, 5000)
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsString()
  milestoneId?: string;
}


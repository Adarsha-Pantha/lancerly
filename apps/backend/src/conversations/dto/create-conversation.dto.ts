import { IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  freelancerId: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}


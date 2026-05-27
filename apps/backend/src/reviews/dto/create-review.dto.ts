import { IsString, IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  contractId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

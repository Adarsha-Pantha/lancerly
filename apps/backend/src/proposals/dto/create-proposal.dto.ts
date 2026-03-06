import { IsString, IsOptional, IsInt, Min, Length } from 'class-validator';

export class CreateProposalDto {
  @IsString()
  @Length(50, 5000)
  coverLetter!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  proposedBudget?: number;
}


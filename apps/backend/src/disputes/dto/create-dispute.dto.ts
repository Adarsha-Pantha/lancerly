import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  contractId: string;

  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  @IsOptional()
  type?: string; // PAYMENT, SCOPE, DELIVERY, QUALITY, OTHER
}

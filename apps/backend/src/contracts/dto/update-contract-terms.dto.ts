import { IsString, IsOptional } from 'class-validator';

export class UpdateContractTermsDto {
  @IsOptional()
  @IsString()
  terms?: string;
}

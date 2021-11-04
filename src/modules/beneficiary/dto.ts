import { IsOptional, IsString } from 'class-validator';

class BeneficiaryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  account_bank?: string;

  @IsString()
  recipient_id?: string;
}

export { BeneficiaryDto };

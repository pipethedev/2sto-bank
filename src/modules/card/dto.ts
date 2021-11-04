import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

class VirtualCardDto {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  account_id: string;
}

class FundCardDto {
  @IsString()
  @IsUUID()
  account_id: string;

  @IsString()
  debit_currency: string;

  @IsNumber()
  amount: number;
}

export { VirtualCardDto, FundCardDto };

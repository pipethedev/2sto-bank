import { IsBoolean, IsNumber, IsString, IsUUID } from 'class-validator';

class CardDto {
  @IsString()
  card_number: string;

  @IsString()
  cvv: string;

  @IsString()
  expiry_month: string;

  @IsString()
  expiry_year: string;

  @IsString()
  currency: string;

  @IsString()
  pin: string;
}

class ValidateDto {
  @IsUUID()
  @IsString()
  card_id: string;

  @IsString()
  otp: string;
}

class CardChargeDto {
  @IsUUID()
  @IsString()
  account_id: string;

  @IsUUID()
  @IsString()
  card_id: string;

  @IsNumber()
  amount: number;

  @IsBoolean()
  saved: boolean;
}

export { CardDto, ValidateDto, CardChargeDto };

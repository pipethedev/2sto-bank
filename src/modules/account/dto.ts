import { CURRENCY, PLATFORM } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

class AccountDto {
  @IsOptional()
  nickname?: string;

  @IsOptional()
  user_id: string;

  @IsEnum(CURRENCY, { message: 'Please provide a currency type' })
  currency: CURRENCY;
}

class TransferDto {
  @IsOptional()
  @IsUUID()
  @IsString()
  account_id: string;

  @IsOptional()
  @IsString()
  tag_name?: string;

  @IsOptional()
  @IsString()
  account_bank?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  recipient?: string;

  @IsOptional()
  @IsString()
  recipient_account_uid?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  narration?: string;

  @IsOptional()
  @IsString()
  qr_code?: string;

  @IsEnum(CURRENCY, { message: 'Please provide a currency type' })
  currency: CURRENCY;

  @IsEnum(PLATFORM, { message: 'Please provide a valid platform' })
  platform: PLATFORM;

  @IsOptional()
  pin?: string;

  @IsOptional()
  bio?: string;

  @IsBoolean()
  scheduled: boolean;

  @IsOptional()
  @IsDateString()
  schedule_date?: string;
}

class LinkDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  narration: string;
}

export { AccountDto, TransferDto, LinkDto };

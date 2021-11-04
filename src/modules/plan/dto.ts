import { CURRENCY } from '@prisma/client';
import { IsOptional, IsInt, IsString, IsUUID } from 'class-validator';

class PlanDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsString()
  account_id: string;

  @IsOptional()
  emoji?: string;

  @IsOptional()
  @IsInt()
  spent?: number;

  @IsOptional()
  @IsInt()
  limit: number;
}

export { PlanDto };

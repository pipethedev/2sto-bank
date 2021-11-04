import { CURRENCY } from '@prisma/client';
import { IsEnum, IsOptional, IsInt, IsString, IsUUID } from 'class-validator';

class AdminUserDto {
  @IsUUID()
  @IsString()
  user_id: string;

  @IsString()
  name: string;

  @IsOptional()
  emoji?: string;

  @IsOptional()
  @IsInt()
  spent?: number;

  @IsOptional()
  @IsInt()
  limit?: number;
}

export { AdminUserDto };

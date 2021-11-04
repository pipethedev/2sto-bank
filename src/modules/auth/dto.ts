import { KYC } from '@enum/auth';
import { Match } from '@utils/decorators/validator';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

class Email {
  @IsEmail({}, { message: 'Please provide a valid email' })
  readonly email: string;
}
class BVNDto {
  @IsString()
  phone: string;

  @IsString()
  bvn: string;

  @IsEnum(KYC, { message: 'Please provide a kyc type' })
  readonly type: KYC;
}
class CreateUserDto extends Email {
  @IsUUID()
  @IsString()
  user_id: string;

  @IsString({ message: 'Please provide a valid username' })
  username: string;

  @IsString({ message: 'Please provide a valid phone number' })
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  pin: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Match('password', { message: 'Password not match' })
  passwordConfirm: string;
}

export { CreateUserDto, BVNDto };

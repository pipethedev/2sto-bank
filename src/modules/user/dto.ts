import { USER_ROLES } from '@prisma/client';
import { AUTH_TYPE, KYC } from '@enum/auth';
import { Match } from '@utils/decorators/validator';
import {
  IsArray,
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

class CreateUserDto extends Email {
  @IsString({ message: 'Please provide a valid firstname' })
  @IsOptional()
  firstname?: string;

  @IsString({ message: 'Please provide a valid firstname' })
  @IsOptional()
  lastname?: string;

  @IsString({ message: 'Please provide a valid phone number' })
  @MaxLength(14)
  @IsOptional()
  phone: string;

  @IsString({ message: 'Please provide a valid username' })
  @IsOptional()
  username: string;

  @IsEnum(USER_ROLES, { message: 'Please provide a valid type' })
  @IsOptional()
  readonly role?: USER_ROLES;

  @IsString()
  bvn: string;

  @IsEnum(KYC, { message: 'Please provide a kyc type' })
  readonly type: KYC;

  @IsString()
  @IsOptional()
  address?: string;

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

class AuthAdminUserDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly password: string;
}

class AuthUserDto extends Email {
  @IsEnum(AUTH_TYPE, {
    message: 'Please provide a valid authentication method',
  })
  readonly type: AUTH_TYPE;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsString()
  @IsOptional()
  readonly bio?: string;

  @IsString()
  readonly device_id: string;
}

class RecoverPasswordDto extends Email {}

class ResetPasswordDto {
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

class AssignUserDto {
  @IsString()
  @IsUUID()
  uid: string;

  @IsEnum(USER_ROLES, { message: 'Please provide a valid type' })
  readonly role: USER_ROLES;
}

class DeleteBatchUserDto {
  @IsUUID(undefined, { each: true })
  @IsArray()
  users: string[];
}

class UpdateEMail extends Email {
  @IsString()
  otp: string;
}

class UpdatePinDto {
  @IsString()
  old_pin: string;

  @IsString()
  new_pin: string;

  @IsString()
  @Match('new_pin', { message: 'pin does not match' })
  confirm_pin: string;
}

export {
  CreateUserDto,
  AuthAdminUserDto,
  AuthUserDto,
  RecoverPasswordDto,
  ResetPasswordDto,
  AssignUserDto,
  DeleteBatchUserDto,
  UpdateEMail,
  UpdatePinDto,
};

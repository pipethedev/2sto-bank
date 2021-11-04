import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CURRENCY, User } from '@prisma/client';
import UserService from '@user/service';
import AdminUserService from '@admin_user/service';
import { BVNDto, CreateUserDto } from '../auth/dto';
import { omit } from '@utils/app';
import { signToken } from '@utils/jwt';
import MailService from '@mail/service';
import kycService from '@services/kyc';
import OTPService from '@services/otp';
import {
  AuthAdminUserDto,
  AuthUserDto,
  RecoverPasswordDto,
  ResetPasswordDto,
} from '@user/dto';
import { userExcludeArray } from '@constants/prisma';
import { AUTH_TYPE } from '@enum/auth';
import { UserBuidObj } from '@interface/entities';
import { encrypt, verify } from '@utils/bcrypt';
import * as QRCode from 'qrcode';
import AccountService from '@account/service';

@Controller('/auth')
class AuthController {
  constructor(
    private readonly authService: UserService,
    private readonly authAdminService: AdminUserService,
    private readonly emailService: MailService,
    private readonly kyc: kycService,
    private readonly otpService: OTPService,
    private readonly accountService: AccountService,
  ) {}

  @Post('/pre-auth/sign-up')
  async create(@Body() body: BVNDto) {
    //Verify & KYC
    const verify = await this.kyc.verify(body.bvn, body.type);

    if (verify.code) {
      throw new BadRequestException('Invalid bvn provided, check again');
    }

    //Build new user object
    const data: UserBuidObj = {
      firstname: verify.first_name,
      lastname: verify.last_name,
      phone: body.phone,
      bvn: body.bvn,
    };

    console.log(verify.otp);

    //Send OTP To verify user & register user temporarily
    return await this.otpService.sendOTP(verify.otp, body.phone, data);
  }

  @Post('/sign-up')
  async createUser(@Body() body: CreateUserDto) {
    try {
      //verify if otp matches
      const fetched = await this.authService.getUserById(body.user_id);
      const verify = await this.authService.verifyOTP(body.otp, fetched.otp);
      if (verify) {
        const name = `${fetched.lastname} ${fetched.firstname}`;

        // sign token
        const token = signToken(fetched.uid);

        // generate verification token
        const verifyToken = await this.authService.generateVerifyTokenForUser(
          fetched.uid,
        );
        const user = await this.authService.update(body.user_id, {
          username: body.username,
          phone: fetched.phone,
          pin: await encrypt(body.pin),
          email: body.email,
          otp: null,
          qrcode: await QRCode.toDataURL(String(body.user_id)),
          otp_verified: true,
          password: await encrypt(body.password),
        });

        //send token to user mail for verification
        //TODO: This mail is gonna be scheduled
        await this.emailService.sendAccountVerificationEmail(
          verifyToken,
          user.email,
          name,
        );

        //create default naria account
        await this.accountService.create({
          currency: CURRENCY.NGN,
          user_id: body.user_id,
        });
        // return user and token
        return {
          token,
          ...omit<User>(user, userExcludeArray),
        };
      } else {
        throw new UnauthorizedException('OTP does not match, check again');
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('/sign-in')
  async authenticateUser(@Body() body: AuthUserDto) {
    let message = null;
    //Authentication is in two phase
    //Biometrics or the traditional Email & Password
    const user =
      body.type == AUTH_TYPE.PASSWORD
        ? await this.authService.getUserByEmailAndPassword(body)
        : await this.authService.getUserByBiometrics(body.bio);

    const token = signToken(user.uid);

    if (user.deviceId !== body.device_id) {
      message =
        'A different device accessed your account, if you did not initiate this login, change your password or contact support';
    }

    return {
      ...omit<User>(user, userExcludeArray),
      token,
      message,
    };
  }

  @Post('/admin/sign-in')
  async authenticateAdminUser(@Body() body: AuthAdminUserDto) {
    const result = await this.authAdminService.getByUsername(body.username);
    if (!result) {
      return {
        err: { message: 'User not exist' },
      };
    }
    const { id, uid, password, ...user } = result;
    const verified = await verify(body.password, password);
    if (!verified) {
      return {
        err: { message: 'Password is incorrect' },
      };
    }

    const accessToken = signToken(uid, true);

    return {
      user,
      accessToken,
    };
  }

  @Get('/verify-email/:token')
  async verifyUserEmail(@Param('token') token: string) {
    // Get user based on the token
    let user = await this.authService.getUserByVerificationToken(token);

    // 2) If there is a user, set the new password
    user = await this.authService.verifyUser(user.uid);

    return omit<User>(user, userExcludeArray);
  }

  @Post('/recover-password')
  async recoverPassword(@Body() body: RecoverPasswordDto) {
    // get user by the provided email
    const user = await this.authService.getUserByEmail(body.email);

    // Generate the random reset token
    const resetToken = await this.authService.generateResetTokenForUser(
      user.uid,
    );

    const name = `${user.lastname} ${user.firstname}`;

    // Send it to user's email
    await this.emailService.sendResetPasswordEmail(
      resetToken,
      user.email,
      name,
    );

    return { message: 'Please check your email' };
  }

  @Post('/reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() body: ResetPasswordDto,
  ) {
    // Get user based on the token
    let user = await this.authService.getUserByResetToken(token);

    // 2) If there is a user, set the new password
    user = await this.authService.resetUserPassword(user.uid, body);

    return omit<User>(user, userExcludeArray);
  }
}

export default AuthController;

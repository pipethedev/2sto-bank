import { Module } from '@nestjs/common';
import AuthController from '@auth/controller';
import UserService from '@user/service';
import AdminUserService from '@admin_user/service';
import MailService from '@mail/service';
import PrismaService from '@services/prisma';
import StorageService from '@services/storage';
import kycService from '@services/kyc';
import TransactionService from '@transaction/service';
import OTPService from '@services/otp';
import AccountService from '@account/service';
import RaveService from '@services/flutterwave';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    UserService,
    AdminUserService,
    MailService,
    PrismaService,
    StorageService,
    RaveService,
    kycService,
    AccountService,
    TransactionService,
    OTPService,
  ],
})
export default class AuthModule {}

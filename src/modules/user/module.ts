import { Module } from '@nestjs/common';
import MailService from '@mail/service';
import StorageService from '@services/storage';
import AccountService from '@account/service';
import UserController from '@user/controller';
import UserService from '@user/service';
import AdminUserService from '@admin_user/service';
import PrismaService from '@services/prisma';
import RaveService from '@services/flutterwave';
import TransactionService from '@transaction/service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    AdminUserService,
    MailService,
    AccountService,
    TransactionService,
    RaveService,
    PrismaService,
    StorageService,
  ],
})
export default class UserModule {}

import { Module } from '@nestjs/common';
import VirtualCardController from '@card/controller';
import VirtualCardService from '@card/service';
import PrismaService from '@services/prisma';
import UserService from '@user/service';
import MailService from '@mail/service';
import StorageService from '@services/storage';
import AdminUserService from '@admin_user/service';
import RaveService from '@services/flutterwave';
import AccountService from '@account/service';
import TransactionService from '@transaction/service';

@Module({
  imports: [],
  controllers: [VirtualCardController],
  providers: [
    PrismaService,
    VirtualCardService,
    MailService,
    RaveService,
    AccountService,
    UserService,
    TransactionService,
    StorageService,
    AdminUserService,
  ],
})
export default class VirtualCardModule {}

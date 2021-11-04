import { Module } from '@nestjs/common';
import PrismaService from '@services/prisma';
import MailService from '@mail/service';
import StorageService from '@services/storage';
import DebitCardController from '@debit/controller';
import DebitCardService from './service';
import RaveService from '@services/flutterwave';
import UserService from '@user/service';
import AccountService from '@account/service';
import TransactionService from '@transaction/service';
import AdminUserService from '@admin_user/service';

@Module({
  imports: [],
  controllers: [DebitCardController],
  providers: [
    PrismaService,
    MailService,
    UserService,
    RaveService,
    AccountService,
    StorageService,
    AccountService,
    AdminUserService,
    TransactionService,
    DebitCardService,
  ],
})
export default class DebitCardModule {}

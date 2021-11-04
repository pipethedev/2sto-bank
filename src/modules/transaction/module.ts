import { Module } from '@nestjs/common';
import TransactionController from '@transaction/controller';
import PrismaService from '@services/prisma';
import UserService from '@modules/user/service';
import MailService from '@mail/service';
import AdminUserService from '@admin_user/service';
import StorageService from '@services/storage';
import TransactionService from '@transaction/service';

@Module({
  imports: [],
  controllers: [TransactionController],
  providers: [
    PrismaService,
    UserService,
    MailService,
    StorageService,
    AdminUserService,
    TransactionService,
  ],
})
export default class TransactionModule {}

import { Module } from '@nestjs/common';
import AdminUserController from '@admin_user/controller';
import PrismaService from '@services/prisma';
import AdminUserService from '@admin_user/service';
import UserService from '@user/service';
import MailService from '@mail/service';
import StorageService from '@services/storage';

@Module({
  imports: [],
  controllers: [AdminUserController],
  providers: [
    PrismaService,
    AdminUserService,
    UserService,
    MailService,
    StorageService,
  ],
})
export default class AdminUserModule {}

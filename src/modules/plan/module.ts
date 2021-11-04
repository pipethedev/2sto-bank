import { Module } from '@nestjs/common';
import PlanController from '@plan/controller';
import PrismaService from '@services/prisma';
import PlanService from '@plan/service';
import UserService from '@modules/user/service';
import AdminUserService from '@admin_user/service';
import MailService from '@mail/service';
import StorageService from '@services/storage';

@Module({
  imports: [],
  controllers: [PlanController],
  providers: [
    PrismaService,
    PlanService,
    UserService,
    AdminUserService,
    MailService,
    StorageService,
  ],
})
export default class PlanModule {}

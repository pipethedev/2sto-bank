import { Module } from '@nestjs/common';
import BeneficiaryController from '@beneficiary/controller';
import BeneficiaryService from '@beneficiary/service';
import PrismaService from '@services/prisma';
import UserService from '@user/service';
import MailService from '@mail/service';
import StorageService from '@services/storage';
import AdminUserService from '@admin_user/service';

@Module({
  imports: [],
  controllers: [BeneficiaryController],
  providers: [
    PrismaService,
    UserService,
    BeneficiaryService,
    MailService,
    UserService,
    AdminUserService,
    StorageService,
  ],
})
export default class BeneficiaryModule {}

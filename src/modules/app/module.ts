import { Module } from '@nestjs/common';
import { AppController } from './controller';
import AppService from '@app/service';
import UserService from '@user/service';
import MailService from '@mail/service';
import PrismaService from '@services/prisma';
import StorageService from '@services/storage';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    UserService,
    MailService,
    StorageService,
  ],
})
export default class AppModule {}

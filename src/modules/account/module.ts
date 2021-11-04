import { Module } from '@nestjs/common';
import AccountController from '@account/controller';
import RaveService from '@services/flutterwave';
import PrismaService from '@services/prisma';
import UserService from '@modules/user/service';
import AdminUserService from '@admin_user/service';
import MailService from '@mail/service';
import StorageService from '@services/storage';
import AccountService from '@account/service';
// import PinMiddleware from '@middlewares/pin.middleware';
// import { SufficientMiddleware } from '@middlewares/sufficient.middleware';
import ScheduleService from '@services/scheduler';
import { SchedulerRegistry } from '@nestjs/schedule';
import TransactionService from '@transaction/service';
import NotificationService from '@services/notification';

@Module({
  imports: [],
  controllers: [AccountController],
  providers: [
    PrismaService,
    RaveService,
    UserService,
    AdminUserService,
    MailService,
    StorageService,
    AccountService,
    TransactionService,
    ScheduleService,
    NotificationService,
    SchedulerRegistry,
  ],
})
export default class AccountModule {}
// export default class AccountModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(PinMiddleware)
//       .forRoutes({ path: 'account/transfer', method: RequestMethod.POST });
//     consumer
//       .apply(SufficientMiddleware)
//       .forRoutes({ path: 'account/transfer', method: RequestMethod.POST });
//   }
// }

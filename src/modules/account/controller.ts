import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccountDto, LinkDto, TransferDto } from '@account/dto';
import AccountService from '@account/service';
import AuthGuard from '@guards/auth';
import VerificationAccessGuard from '@guards/verification';
import { VerificationStatus } from '@enum/auth';
import { UserRoles, VerificationAccess } from '@utils/decorators/auth';
import { USER_ROLES } from '@prisma/client';
import ScheduleService from '@services/scheduler';
import NotificationService from '@services/notification';

@Controller('/account')
@UseGuards(AuthGuard, VerificationAccessGuard)
@VerificationAccess(VerificationStatus.VERIFIED)
class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly scheduleService: ScheduleService,
    private readonly notify: NotificationService,
  ) {}

  @Post('/create')
  @UserRoles(USER_ROLES.MEMBER)
  async create(@Body() body: AccountDto, @Req() req: any) {
    try {
      body.user_id = req.user.uid;
      return await this.accountService.create(body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('/transfer')
  @UserRoles(USER_ROLES.MEMBER)
  async transfer(@Body() body: TransferDto, @Req() req: any) {
    try {
      let transfer;
      if (!body.schedule_date) {
        transfer = await this.accountService.transfer(body, req.user.uid);
      } else {
        transfer = await this.scheduleService.scheduleTransfer(
          body,
          req.user.uid,
        );
      }
      //send notification here
      // await this.notify.send('', req.user.uid);
      return transfer;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('/transactions/:accountId')
  @UserRoles(USER_ROLES.MEMBER)
  async getTransactions(@Param('accountId') accountId: string) {
    try {
      return await this.accountService.transactions(accountId);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //Generate payment link
  @Post('/transfer/payment-link')
  @UserRoles(USER_ROLES.MEMBER)
  async generatePaymentLink(@Req() req: any, @Body() data: LinkDto) {
    try {
      return await this.accountService.generateLink(req.user.uid, data);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
  //De-activate payment link
  @Post('/transfer/payment-link/:token')
  @UserRoles(USER_ROLES.MEMBER)
  async makePayment() {
    try {
    } catch (e) {}
  }
}

export default AccountController;

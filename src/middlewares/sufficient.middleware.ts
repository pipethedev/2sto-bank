import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  Req,
} from '@nestjs/common';
import { NextFunction } from 'express';
import AccountService from '@account/service';

@Injectable()
export class SufficientMiddleware implements NestMiddleware {
  constructor(private readonly accountService: AccountService) {}
  async use(@Req() req: any, next: NextFunction) {
    //Ensure user has enough money in account
    const account = await this.accountService.getSingleAccount(
      req.body.account_id,
      req.user.uid,
    );
    if (account.balance < req.body.amount) {
      throw new BadRequestException(
        'Insufficient fund !, kindly fund your account',
      );
    }
    next();
  }
}

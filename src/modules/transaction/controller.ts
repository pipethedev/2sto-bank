import AuthGuard from '@guards/auth';
import VerificationAccessGuard from '@guards/verification';
import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { USER_ROLES } from '@prisma/client';
import { VerificationStatus } from '@enum/auth';
import { UserRoles, VerificationAccess } from '@utils/decorators/auth';
import TransactionService from '@transaction/service';

@Controller('/transactions')
@UseGuards(AuthGuard, VerificationAccessGuard)
@VerificationAccess(VerificationStatus.VERIFIED)
class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/find')
  @UserRoles(USER_ROLES.ADMIN)
  async getPaginationTransactions(@Req() req: any) {
    try {
      return await this.transactionService.paginate(req);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('/')
  async getAllByUser(@Req() req: any) {
    try {
      return await this.transactionService.get(req.user.uid);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //Fetch single transaction
  @Get('/:transactionId')
  async getSingle(
    @Req() req: any,
    @Param('transactionId') transactionId: string,
  ) {
    try {
      return await this.transactionService.single(req.user.uid, transactionId);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //Filter By Date & Transaction Type
}

export default TransactionController;

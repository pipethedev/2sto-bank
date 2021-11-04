import AuthGuard from '@guards/auth';
import VerificationAccessGuard from '@guards/verification';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ACTION, VerificationStatus } from '@enum/auth';
import { UserRoles, VerificationAccess } from '@utils/decorators/auth';
import VirtualCardService from '@card/service';
import { USER_ROLES } from '@prisma/client';
import { FundCardDto, VirtualCardDto } from './dto';

@Controller('/virtual-cards')
@UseGuards(AuthGuard, VerificationAccessGuard)
@VerificationAccess(VerificationStatus.VERIFIED)
class VirtualCardController {
  constructor(private readonly cardService: VirtualCardService) {}

  @Post('/create')
  @UserRoles(USER_ROLES.MEMBER)
  async create(@Req() req: any, @Body() body: VirtualCardDto) {
    try {
      return await this.cardService.create(req.user.uid, body);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  //Fund card
  @Post('/fund/:id')
  @UserRoles(USER_ROLES.MEMBER)
  async fund(
    @Req() req: any,
    @Body() body: FundCardDto,
    @Param('id') id: string,
  ) {
    try {
      const card = await this.cardService.getSingle(id, req.user.uid);
      return await this.cardService.fund(card.card_fund_id, body, req.user.uid);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/all')
  @UserRoles(USER_ROLES.MEMBER)
  async fetchAll(@Req() req: any) {
    try {
      return await this.cardService.all(req.user.uid);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/:id')
  @UserRoles(USER_ROLES.MEMBER)
  async single(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.cardService.getSingle(id, req.user.uid);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/:id/:action')
  async action(
    @Param('id') id: string,
    @Param('action') action: ACTION,
    @Req() req: any,
  ) {
    try {
      return await this.cardService.action(id, action, req.user.uid);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/:id/transactions')
  async getTransaction() {
    try {
    } catch (e) {}
  }

  //withdraw money from card
}

export default VirtualCardController;

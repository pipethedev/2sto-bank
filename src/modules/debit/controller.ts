import AuthGuard from '@guards/auth';
import VerificationAccessGuard from '@guards/verification';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VerificationStatus } from '@enum/auth';
import { UserRoles, VerificationAccess } from '@utils/decorators/auth';
import { CardChargeDto, CardDto, ValidateDto } from '@debit/dto';
import DebitCardService from '@debit/service';
import { USER_ROLES } from '@prisma/client';
import { CardCharge } from '@interface/entities';
import UserService from '@user/service';
import { generateToken } from '@utils/randomizer';
import AccountService from '@account/service';

@Controller('/debit-cards')
@UseGuards(AuthGuard, VerificationAccessGuard)
@VerificationAccess(VerificationStatus.VERIFIED)
class DebitCardController {
  constructor(
    private readonly debitCardService: DebitCardService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}

  //Add a debit card
  @Post('/add')
  @UserRoles(USER_ROLES.MEMBER)
  async addDebitCard(@Body() card: CardDto, @Req() req: any) {
    try {
      return await this.debitCardService.addCard(card, req.user.uid);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //Validate OTP sent on behalf of card
  @Post('/validate')
  async validateCard(@Body() card: ValidateDto, @Req() req: any) {
    try {
      return await this.debitCardService.validate(card, req.user.uid);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //Fund account via card
  @Post('/fund')
  @UserRoles(USER_ROLES.MEMBER)
  async fundViaCard(@Body() body: CardChargeDto, @Req() req: any) {
    try {
      //If saved is true use saved card
      if (body.saved) {
        const user = await this.userService.getUserById(req.user.uid);
        const account = await this.accountService.getSingleAccount(
          body.account_id,
          user.uid,
        );
        const card = await this.debitCardService.getSingle(
          body.card_id,
          req.user.uid,
        );
        //Card charge object
        const charge: CardCharge = {
          token: card.authKey,
          currency: 'NGN',
          country: 'NG',
          amount: Number(body.amount),
          email: user.email,
          first_name: user.firstname,
          last_name: user.lastname,
          tx_ref: generateToken(),
          narration: '2STO Account funding',
        };

        const details = {
          account_id: body.account_id,
          user_id: user.uid,
          last4: card.last4,
        };

        return await this.debitCardService.charge(account, charge, details);
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //Fetch all cards
  @Get('/')
  @UserRoles(USER_ROLES.MEMBER)
  async getAllCards(@Req() req: any) {
    try {
      return await this.debitCardService.get(req.user.uid);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //Remove a card
  @Delete('/:cardId')
  @UserRoles(USER_ROLES.MEMBER)
  async removeCard(@Param('cardId') cardId: string) {
    try {
      return await this.debitCardService.delete(cardId);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}

export default DebitCardController;

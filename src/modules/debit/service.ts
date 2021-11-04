import { Injectable } from '@nestjs/common';
import RaveService from '@services/flutterwave';
import PrismaService from '@services/prisma';
import { CardDto, ValidateDto } from '@debit/dto';
import { Card, PLATFORM, Prisma, TYPE } from '.prisma/client';
import { Account, CARDTYPE } from '@prisma/client';
import { CardCharge } from '@interface/entities';
import AccountService from '@account/service';
import { OPERATION } from '@enum/auth';
import TransactionService from '@transaction/service';

@Injectable()
class DebitCardService {
  constructor(
    private readonly raveService: RaveService,
    private readonly accountService: AccountService,
    private readonly prismaService: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async addCard(body: CardDto, user_id: string): Promise<any> {
    try {
      const response = await this.raveService.cardCheck(user_id, body);
      const data: Prisma.CardUncheckedCreateInput = {
        user_id,
        pan_number: '',
        authKey: response.data.flw_ref,
        last4: '',
        expiry: '',
        type: CARDTYPE.VISA,
      };
      if (response.status) {
        //Store it to database
        const card = await this.prismaService.card.create({
          data,
        });
        return {
          message:
            'Kindly enter the OTP sent to the number associated to the debit card',
          ...card,
        };
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async get(user_id: string): Promise<Card[]> {
    try {
      return await this.prismaService.card.findMany({
        where: {
          user_id,
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  //get a single card
  async getSingle(card_id: string, user_id: string): Promise<Card> {
    try {
      return await this.prismaService.card.findFirst({
        where: {
          uid: card_id,
          user_id,
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async delete(card_id: string): Promise<Card> {
    try {
      return await this.prismaService.card.delete({
        where: {
          uid: card_id,
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  //Validate card with OTP
  async validate(body: ValidateDto, user_id: string) {
    try {
      const card = await this.getSingle(body.card_id, user_id);
      const validate = await this.raveService.validate(body, card.authKey);
      return await this.prismaService.card.update({
        where: {
          uid: body.card_id,
        },
        data: {
          pan_number: validate.data.card.first_6digits,
          authKey: validate.data.flw_ref,
          last4: validate.data.card.last_4digits,
          expiry: validate.data.card.expiry,
          type: validate.data.card.type,
          active: true,
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async charge(account: Account, charge: CardCharge, details: any) {
    try {
      //update account
      const { status } = await this.raveService.cardCharge(charge);
      if (status == 'success') {
        const transaction: Prisma.TransactionUncheckedCreateInput = {
          budget_id: null,
          account_id: details.account_id,
          user_id: details.user_id,
          recipient_id: null,
          summary: `Money added via ${details.last4}`,
          analytics: true,
          amount: charge.amount,
          alert_type: TYPE.CREDIT,
          type: PLATFORM.CARD,
          narration: '2STO Account funding',
        };
        await this.transactionService.add(transaction);
        return await this.accountService.updateBalance(
          account,
          OPERATION.ADD,
          charge.amount,
        );
      }
    } catch (e) {}
  }
}
export default DebitCardService;

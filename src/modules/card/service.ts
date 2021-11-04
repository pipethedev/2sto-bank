import AccountService from '@account/service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma, VirtualCard } from '@prisma/client';
import RaveService from '@services/flutterwave';
import PrismaService from '@services/prisma';
import { ACTION, OPERATION } from '@enum/auth';
import { FundCardDto } from './dto';

@Injectable()
class VirtualCardService {
  constructor(
    private readonly raveService: RaveService,
    private readonly accountService: AccountService,
    private readonly prismaService: PrismaService,
  ) {}

  //create new virtual card
  async create(user_id: string, body: any) {
    try {
      //return 'created';
      const virtual = await this.raveService.card(user_id);
      const data: Prisma.VirtualCardUncheckedCreateInput = {
        user_id,
        nickname: body.nickname,
        card_pan: virtual.data.card_pan,
        card_fund_id: virtual.data.id,
        masked_pan: virtual.data.masked_pan,
        cvv: virtual.data.cvv,
        city: virtual.data.city,
        state: virtual.data.state,
        billing_address: virtual.data.address_1,
        expiry: virtual.data.expiration,
      };
      const store = await this.store(data);
      if (virtual.status == 'success') {
        //fetch account;
        const account = await this.accountService.getSingleAccount(
          body.account_id,
          user_id,
        );
        //work on real time rates
        const amount = account.currency == 'USD' || 'EUR' || 'GBP' ? 15 : 5000;
        await this.accountService.updateBalance(
          account,
          OPERATION.SUBTRACT,
          amount,
        );
      }
      return {
        message: 'Virtual card created successfully',
        ...store,
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async fund(id: string, data: FundCardDto, user_id: string) {
    try {
      const response = await this.raveService.fundCard(id, data);
      if (response.status == 'success') {
        //debit account
        const account = await this.accountService.getSingleAccount(
          data.account_id,
          user_id,
        );
        await this.accountService.updateBalance(
          account,
          OPERATION.SUBTRACT,
          data.amount,
        );
        return {
          message: 'Card funded successfully',
          debit_account: account,
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async store(data: Prisma.VirtualCardUncheckedCreateInput) {
    return await this.prismaService.virtualCard.create({
      data,
    });
  }

  //fetch a virtual card
  async getSingle(id: string, user_id: string) {
    try {
      return await this.prismaService.virtualCard.findFirst({
        where: {
          uid: id,
          user_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //fetch all users virtual cards
  async all(user_id: string): Promise<VirtualCard[]> {
    try {
      return await this.prismaService.virtualCard.findMany({
        where: {
          user_id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //block & unblock a card
  async action(id: string, action: ACTION, user_id: string): Promise<any> {
    try {
      const card = await this.getSingle(id, user_id);
      const response = await this.raveService.action(card.card_fund_id, action);
      console.log(response);
      if (response.status == 'success') {
        return {
          message: `Your virtual card has been successfully ${action}ed`,
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //Transactions associated to a virtual card
  async transactions() {
    try {
    } catch (e) {}
  }
}

export default VirtualCardService;

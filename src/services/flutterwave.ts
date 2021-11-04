import fetch from 'node-fetch';
import UserService from '@user/service';
import { Injectable } from '@nestjs/common';
import { ACTION, METHOD } from '@enum/auth';
import { TransferDto } from '@modules/account/dto';
import { CardDto, ValidateDto } from '@debit/dto';
import { generateTransactionID } from '@utils/randomizer';
import { three3d } from '@utils/bcrypt';
import { CardCharge, CardInterface } from '@interface/entities';
import { FundCardDto } from '@card/dto';

@Injectable()
class RaveService {
  constructor(private readonly user: UserService) {}

  async worker(url: string, body: any, method: METHOD): Promise<any> {
    try {
      const result = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RAVE_SECRET}`,
        },
      });
      return await result.json();
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async createVirtual(user_id: string): Promise<any> {
    try {
      const user = await this.user.getUserById(user_id);
      return await this.worker(
        'https://api.flutterwave.com/v3/virtual-account-numbers',
        {
          email: user.email,
          is_permanent: true,
          bvn: user.bvn,
          phonenumber: user.phone,
          firstname: user.firstname,
          lastname: user.lastname,
        },
        METHOD.POST,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async transfer(transfer: TransferDto) {
    try {
      return await this.worker(
        'https://api.flutterwave.com/v3/transfers',
        {
          account_bank: transfer.account_bank,
          account_number: transfer.account_number,
          amount: transfer.amount,
          narration: transfer.narration,
          currency: 'NGN',
          debit_currency: 'NGN',
        },
        METHOD.POST,
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async cardCheck(user_id: string, card: CardDto) {
    const user = await this.user.getUserById(user_id);
    const data: CardInterface = {
      card_number: card.card_number,
      cvv: card.cvv,
      expiry_month: card.expiry_month,
      expiry_year: card.expiry_year,
      currency: 'NGN',
      amount: '100',
      fullname: `${user.lastname} ${user.firstname}`,
      email: user.email,
      tx_ref: generateTransactionID(),
      redirect_url: 'https://webhook.site/3ed41e38-2c79-4c79-b455-97398730866c',
      authorization: {
        mode: 'pin',
        pin: card.pin,
      },
    };
    return await this.worker(
      'https://api.flutterwave.com/v3/charges?type=card',
      {
        client: await three3d(data),
      },
      METHOD.POST,
    );
  }

  async cardCharge(charge: CardCharge) {
    try {
      return await this.worker(
        'https://api.flutterwave.com/v3/tokenized-charges',
        charge,
        METHOD.POST,
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async validate(body: ValidateDto, authKey: string) {
    try {
      const data = {
        otp: body.otp,
        flw_ref: authKey,
        type: 'card',
      };
      return await this.worker(
        'https://api.flutterwave.com/v3/validate-charge',
        data,
        METHOD.POST,
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async card(user_id: string) {
    try {
      const user = await this.user.getUserById(user_id);
      return await this.worker(
        'https://api.flutterwave.com/v3/virtual-cards',
        {
          currency: 'USD',
          amount: 10,
          billing_name: `${user.lastname} ${user.firstname}`,
          billing_country: 'NG',
        },
        METHOD.POST,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async singleCard(id: string) {
    try {
      return await this.worker(
        `https://api.flutterwave.com/v3/virtual-cards/${id}`,
        null,
        METHOD.GET,
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async fundCard(id: string, data: FundCardDto) {
    try {
      return await this.worker(
        `https://api.flutterwave.com/v3/virtual-cards/${id}/fund`,
        {
          debit_currency: data.debit_currency,
          amount: data.amount,
        },
        METHOD.POST,
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async action(id: string, action: ACTION) {
    try {
      return await this.worker(
        `https://api.flutterwave.com/v3/virtual-cards/${id}/status/${action}`,
        null,
        METHOD.POST,
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export default RaveService;

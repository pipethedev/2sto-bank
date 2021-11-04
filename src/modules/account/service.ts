import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TransferDto } from './dto';
import RaveService from '@services/flutterwave';
import PrismaService from '@services/prisma';
import {
  Account,
  CURRENCY,
  Link,
  PLATFORM,
  Prisma,
  Transaction,
  TYPE,
} from '@prisma/client';
import { OPERATION } from '@enum/auth';
import UserService from '@user/service';
import convertCurrency from 'nodejs-currency-converter';
import { generateToken } from '@utils/randomizer';
import TransactionService from '@transaction/service';

@Injectable()
class AccountService {
  constructor(
    private readonly raveService: RaveService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
  ) {}

  async getTagUser(username: string): Promise<Account> {
    const user = await this.userService.getUserByTag(username);
    return await this.prismaService.account.findFirst({
      where: {
        user_id: user.uid,
      },
    });
  }

  async create(data: Prisma.AccountUncheckedCreateInput): Promise<any> {
    try {
      //get user
      const user = await this.userService.getUserById(data.user_id);
      if (data.currency == (CURRENCY.USD || CURRENCY.EUR || CURRENCY.GBP)) {
        //Debit user $10
      }
      //Create virtual account then store to db
      const rave = await this.raveService.createVirtual(user.uid);

      const virtual: Prisma.AccountUncheckedCreateInput = {
        ...data,
        account: rave.data.account_number,
      };
      const create = await this.prismaService.account.create({
        data: virtual,
      });
      return {
        message: 'Virtual account created successfully',
        ...rave.data,
        ...create,
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getSingleAccount(
    account_id: string,
    user_id: string,
  ): Promise<Account> {
    try {
      return await this.prismaService.account.findFirst({
        where: {
          uid: account_id,
          user_id,
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getAccounts(user_id: string): Promise<Account[]> {
    return await this.prismaService.account.findMany({
      where: {
        user_id,
      },
    });
  }

  async updateBalance(account: Account, operation: OPERATION, amount: number) {
    try {
      return await this.prismaService.account.update({
        where: {
          uid: account.uid,
        },
        data: {
          balance:
            operation == OPERATION.ADD
              ? account.balance + amount
              : account.balance - amount,
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async transfer(data: TransferDto, user_id: string): Promise<any> {
    try {
      const account = await this.getSingleAccount(data.account_id, user_id);
      let charges;
      switch (true) {
        case data.platform == PLATFORM.P2P:
          charges = 0;
          data.amount = data.amount + charges;
          await this.p2pTransfer(data, account);
          break;
        case data.platform == PLATFORM.TRANSFER:
          charges = 30;
          data.amount = data.amount + charges;
          await this.bankTransfer(data, account);
          break;
        case data.platform == PLATFORM.QRCODE:
          charges = 50;
          data.amount = data.amount + charges;
          await this.qrTransfer(data, account);
          break;
      }
      //save to transactions to db
      await this.transactionService.add({
        user_id,
        recipient_id: '',
        analytics: true,
        summary: 'Transfer money to ...',
        amount: data.amount,
        alert_type: TYPE.CREDIT,
        type: data.platform,
        narration: data.narration || '',
      });
      //Send push notifications
      return {
        success: 'Transaction initiated successfully',
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async qrTransfer(data: TransferDto, sender: Account) {
    try {
      //Get user by qrcode
      const recipient = await this.getQR(data.qr_code);
      // Get recipient account
      const account = await this.getSingleAccount(
        data.recipient_account_uid,
        recipient.uid,
      );
      console.log(account);
      data.account_number = account.account;
      data.account_bank = account.account_code;
      //Transfer funds to user
      await this.bankTransfer(data, sender);

      //Credit reciepient
      await this.updateBalance(account, OPERATION.ADD, data.amount);
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async bankTransfer(data: TransferDto, sender: Account) {
    try {
      const response = await this.raveService.transfer(data);
      console.log(response);
      if (response.status == 'success') {
        return await this.updateBalance(
          sender,
          OPERATION.SUBTRACT,
          data.amount,
        );
      } else {
        throw new Error('A Transaction error occurred');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async p2pTransfer(data: TransferDto, account: Account) {
    try {
      const sender = await this.getSingleAccount(account.uid, account.user_id);
      const recipient = await this.getSingleAccount(
        data.recipient_account_uid,
        data.recipient,
      );
      if (recipient.currency != data.currency) {
        throw new Error(
          `This user does not have ${data.currency.toLowerCase()} account`,
        );
      }
      //Convert currency
      if (data.currency == CURRENCY.USD) {
        data.amount = Number(this.convert(data.amount, CURRENCY.NGN));
      }

      //Debit Transfer money
      console.log(recipient);
      data.account_number = recipient.account;
      data.account_bank = recipient.account_code;
      await this.bankTransfer(data, sender);

      //Credit reciepient
      await this.updateBalance(recipient, OPERATION.ADD, data.amount);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async convert(amount: number, currency: CURRENCY) {
    return await convertCurrency(amount, 'USD', currency);
  }

  async getQR(qrcode: string) {
    return await this.prismaService.user.findFirst({
      where: {
        qrcode,
      },
    });
  }

  async transactions(account_id: string): Promise<Transaction[]> {
    return await this.prismaService.transaction.findMany({
      where: {
        account_id,
      },
    });
  }

  async generateLink(user_id: string, body: any) {
    try {
      const data: Prisma.LinkUncheckedCreateInput = {
        user_id,
        amount: body.amount,
        narration: body.narration,
        token: generateToken(),
      };
      const link = await this.prismaService.link.create({
        data,
      });
      return {
        payment_url: `https://2sto.co/payment/${link.token}`,
        ...link,
      };
    } catch (e) {}
  }

  async getLink(token: string): Promise<Link> {
    return await this.prismaService.link.findFirst({
      where: {
        token,
      },
    });
  }
  async updateLink(uid: string): Promise<Link> {
    return await this.prismaService.link.update({
      where: {
        uid,
      },
      data: {
        paid: true,
        token: null,
      },
    });
  }
}

export default AccountService;

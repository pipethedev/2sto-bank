import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import PrismaService from '@services/prisma';

@Injectable()
class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async add(
    transaction: Prisma.TransactionUncheckedCreateInput,
  ): Promise<Transaction> {
    return await this.prismaService.transaction.create({
      data: transaction,
    });
  }

  async get(user_id: string): Promise<Transaction[]> {
    return await this.prismaService.transaction.findMany({
      where: {
        user_id,
      },
    });
  }

  async paginate(
    q: any,
  ): Promise<{ total: number; transactions: Transaction[] }> {
    const where = {};
    const take = parseInt(q.pageSize) || 10;
    const skip = q.pageCurrent ? (parseInt(q.pageCurrent) - 1) * take : 0;
    const orderBy: any = [{ createdAt: 'desc' }];
    const include = {
      transactions: true,
    };
    const total = await this.prismaService.transaction.count({ where });
    const transactions = await this.prismaService.transaction.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: true,
      },
    });
    return { total, transactions };
  }

  async single(
    user_id: string,
    transaction_id: string,
  ): Promise<Transaction[]> {
    return await this.prismaService.transaction.findMany({
      where: {
        user_id,
        uid: transaction_id,
      },
    });
  }
}

export default TransactionService;

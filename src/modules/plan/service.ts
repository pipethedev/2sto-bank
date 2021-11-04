import { Injectable } from '@nestjs/common';
import { PlanDto } from './dto';
import PrismaService from '@services/prisma';
import { Plan, Prisma } from '@prisma/client';

@Injectable()
class PlanService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: PlanDto, user_id: string): Promise<any> {
    try {
      const plan = await this.prismaService.plan.create({
        data: { ...data, user_id, account_id: data.account_id },
      });
      const { id, ...inserted } = plan;
      return inserted;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getByUser(user_id: string): Promise<Plan[]> {
    try {
      return await this.prismaService.plan.findMany({
        where: {
          user_id,
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async update(uid: string, data: Prisma.PlanUpdateInput): Promise<Plan> {
    return await this.prismaService.plan.update({
      where: { uid },
      data,
    });
  }

  async delete(uid: string) {
    return await this.prismaService.plan.delete({ where: { uid } });
  }
}

export default PlanService;

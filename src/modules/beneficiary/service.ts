import UserService from '@user/service';
import { Injectable } from '@nestjs/common';
import { Beneficiary, Prisma } from '@prisma/client';
import PrismaService from '@services/prisma';

@Injectable()
class BeneficiaryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}
  async createBeneficiary(
    data: Prisma.BeneficiaryUncheckedCreateInput,
    user_id: string,
  ): Promise<Beneficiary> {
    const recipient = await this.userService.getUserById(data.recipient_id);
    return await this.prismaService.beneficiary.create({
      data: {
        user_id,
        name: `${recipient.lastname} ${recipient.firstname}`,
        ...data,
      },
    });
  }

  async fetchBeneficiaries(user_id: string): Promise<Beneficiary[]> {
    return await this.prismaService.beneficiary.findMany({
      where: {
        user_id,
      },
    });
  }

  async deleteBeneficiary(benefit_id: string): Promise<Beneficiary> {
    return await this.prismaService.beneficiary.delete({
      where: {
        uid: benefit_id,
      },
    });
  }

  async single(uid: string, user_id): Promise<Beneficiary> {
    return await this.prismaService.beneficiary.findFirst({
      where: {
        uid,
        user_id,
      },
    });
  }
}

export default BeneficiaryService;

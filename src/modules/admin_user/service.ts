import { Injectable } from '@nestjs/common';
import PrismaService from '@services/prisma';
import { AdminUser, Prisma } from '@prisma/client';

@Injectable()
class AdminUserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getByUID(uid: string): Promise<AdminUser> {
    try {
      const user = await this.prismaService.adminUser.findFirst({
        where: {
          uid,
        },
      });
      return user;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getByUsername(username: string): Promise<AdminUser> {
    try {
      const user = await this.prismaService.adminUser.findFirst({
        where: {
          username,
        },
      });
      return user;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export default AdminUserService;

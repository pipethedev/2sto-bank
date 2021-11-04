import {
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, Prisma, USER_ROLES, USER_STATUS } from '@prisma/client';
import PrismaService from '@services/prisma';
import { encrypt, verify } from '@utils/bcrypt';
import { createHash, randomBytes } from 'crypto';
import {
  AssignUserDto,
  AuthUserDto,
  CreateUserDto,
  ResetPasswordDto,
  UpdateEMail,
} from './dto';
import MailService from '@mail/service';
import { generateCode } from '@utils/randomizer';
import StorageService from '@services/storage';
import QueryBuilder from '@services/querybuilder';
import { UserBuidObj } from '@interface/entities';

@Injectable()
class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: MailService,
    private readonly storageService: StorageService,
  ) {}

  async createSemiUser(otp: string, data: UserBuidObj): Promise<User> {
    const user: Prisma.UserCreateInput = {
      ...data,
      type: 'BVN',
      otp,
    };

    return await this.prismaService.user.create({ data: user });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    //delete bvn
    delete data.bvn;
    // hash password
    data.password = await encrypt(data.password);
    data.passwordConfirm = undefined;

    // build user object
    const user: Prisma.UserCreateInput = {
      ...data,
      role: USER_ROLES[data.role],
    };

    // create user
    return await this.prismaService.user.create({ data: user });
  }

  async getAllUsers(q: any): Promise<User[]> {
    const query = new QueryBuilder(q);
    return await this.prismaService.user.findMany(
      query.filter().sort().select().paginate().build(),
    );
  }

  async paginateUsers(q: any): Promise<{ total: number; users: User[] }> {
    const where = !q.where
      ? {}
      : {
          OR: ['firstname', 'lastname', 'email', 'phone'].map((field) => {
            const filtered = {};
            filtered[field] = { contains: q.where };
            return filtered;
          }),
        };
    const take = parseInt(q.pageSize) || 10;
    const skip = q.pageCurrent ? (parseInt(q.pageCurrent) - 1) * take : 0;
    const orderBy: any = [{ createdAt: 'desc' }];
    const include = {
      transactions: true,
    };
    const total = await this.prismaService.user.count({ where });
    const users = await this.prismaService.user.findMany({
      where,
      skip,
      take,
      orderBy,
      include,
    });
    return { total, users };
  }

  async generateVerifyTokenForUser(userId: string): Promise<string> {
    const verifyToken = randomBytes(32).toString('hex');
    const accountVerifyToken = createHash('sha256')
      .update(verifyToken)
      .digest('hex');

    await this.prismaService.user.update({
      where: { uid: userId },
      data: {
        accountVerifyToken,
        accountVerifyExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return verifyToken;
  }

  async getUserById(uid: string) {
    return await this.prismaService.user.findFirst({
      where: { uid },
    });
  }

  async getUserDetails(uid: string) {
    return await this.prismaService.user.findUnique({
      where: { uid },
      include: {
        transactions: true,
        accounts: true,
        documents: true,
        // cards: true,
        // virtual_cards: true,
        // plans: true,
        // business: true,
      },
    });
  }

  async update(uid: string, data: any): Promise<User> {
    return await this.prismaService.user.update({
      where: {
        uid,
      },
      data: {
        ...data,
      },
    });
  }
  async updateUserByUID(
    uid: string,
    data: Prisma.UserUncheckedUpdateInput,
  ): Promise<User> {
    let user;
    if (data.email) {
      user = await this.getUserById(uid);
      const fullname = `${user.lastname} ${user.firstname}`;
      const verificationCode = generateCode();
      const code = await encrypt(verificationCode.toString());
      await this.updateUserByUID(uid, {
        otp: code.toString(),
      });
      await this.emailService.sendUpdatedMail(
        fullname,
        user.email,
        verificationCode,
      );
      return user;
    } else {
      user = await this.prismaService.user.update({ where: { uid }, data });
    }
    return user;
  }

  async updateUserFromAdmin(
    uid: string,
    data: Prisma.UserUncheckedUpdateInput,
  ): Promise<User> {
    return await this.prismaService.user.update({ where: { uid }, data });
  }

  async updateEMail(uid: string, body: UpdateEMail) {
    const user = await this.getUserById(uid);
    if ((await verify(body.otp, user.otp == null ? '' : user.otp)) == true) {
      return await this.prismaService.user.update({
        where: { uid },
        data: {
          email: body.email,
          otp: null,
        },
      });
    } else {
      throw new NotAcceptableException(
        'Invalid verification code or expired code',
      );
    }
  }

  async deleteUserByUID(uid: string): Promise<User> {
    return await this.prismaService.user.delete({ where: { uid } });
  }

  async getUserByTag(username: string): Promise<User> {
    return await this.prismaService.user.findFirst({
      where: {
        username,
      },
    });
  }

  async getUserByEmailAndPassword({
    email,
    password,
  }: AuthUserDto): Promise<User> {
    // Check if user exists && password is correct
    const user = await this.prismaService.user.findFirst({ where: { email } });

    if (!user || !(await verify(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async verifyOTP(otp: string, encryptedOTP: string): Promise<boolean> {
    return !!(await verify(otp, encryptedOTP));
  }

  async getUserByBiometrics(bio: string): Promise<User> {
    const user = await this.prismaService.user.findFirst({ where: { bio } });

    if (!user) {
      throw new UnauthorizedException('Invalid user print');
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prismaService.user.findFirst({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User> {
    const accountVerifyToken = createHash('sha256').update(token).digest('hex');

    const user = await this.prismaService.user.findFirst({
      where: {
        accountVerifyToken,
        accountVerifyExpires: { gt: new Date() },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid verification token');
    return user;
  }

  async generateResetTokenForUser(userId: string) {
    const resetToken = randomBytes(32).toString('hex');
    const passwordResetToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await this.prismaService.user.update({
      where: { uid: userId },
      data: {
        passwordResetToken,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return resetToken;
  }

  async getUserByResetToken(token: string): Promise<User> {
    const passwordResetToken = createHash('sha256').update(token).digest('hex');

    const user = await this.prismaService.user.findFirst({
      where: {
        passwordResetToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid reset token');
    return user;
  }

  async resetUserPassword(uid: string, body: ResetPasswordDto): Promise<User> {
    const password = await encrypt(body.password);

    return this.prismaService.user.update({
      where: { uid },
      data: {
        password,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
      },
    });
  }

  async verifyUser(uid: string): Promise<User> {
    return this.prismaService.user.update({
      where: { uid },
      data: {
        accountVerifyToken: null,
        accountVerifyExpires: null,
        email_verified_at: new Date(),
      },
    });
  }

  userChangedPassword(user: User, timestamp: number): boolean {
    if (user.passwordChangedAt) {
      const changedTimestamp = user.passwordChangedAt.getTime() / 1000;
      return timestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
  }

  assignRoleToUser(body: AssignUserDto) {
    return this.prismaService.user.update({
      where: {
        uid: body.uid,
      },
      data: {
        role: body.role,
      },
    });
  }

  async updateStatus(userIds: string[], status: USER_STATUS) {
    return await this.prismaService.user.updateMany({
      where: { uid: { in: userIds } },
      data: {
        status,
      },
    });
  }

  async updateUserProfileImage(userId: string, image: Express.Multer.File) {
    const uploaded = await this.storageService.newUserProfileAttachment(
      userId,
      image,
    );

    return await this.prismaService.user.update({
      where: { uid: userId },
      data: { image: uploaded.Location },
    });
  }
}

export default UserService;

import UserService from '@user/service';
import AdminUserService from '@admin_user/service';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { retrieveTokenValue } from '@utils/jwt';

@Injectable()
class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly adminUserService: AdminUserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [user, is_admin] = await this.getAuth(request);
    request.user = user;
    request.isAdmin = !!is_admin;
    return true;
  }

  async getAuth(req: any): Promise<any> {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split('Bearer')[1].trim();
    }

    if (!token) throw new BadRequestException('Invalid Authorization Token');

    const { id, iat, exp, is_admin } = await retrieveTokenValue<{
      id: string;
      is_admin: boolean;
    }>(token);

    if (is_admin) {
      const admin_user = await this.adminUserService.getByUID(id);
      if (!admin_user)
        throw new UnauthorizedException(
          'The admin user belonging to this token no longer exist',
        );

      const now = new Date();
      if (exp < now.getTime() / 1000)
        throw new UnauthorizedException(
          'Admin User recently changed password! Please log in again.',
        );

      return [admin_user, is_admin];
    }

    const user = await this.userService.getUserById(id);

    if (!user)
      throw new UnauthorizedException(
        'The user belonging to this token no longer exist',
      );

    if (this.userService.userChangedPassword(user, iat))
      throw new UnauthorizedException(
        'User recently changed password! Please log in again.',
      );

    return [user, is_admin];
  }
}

export default AuthGuard;

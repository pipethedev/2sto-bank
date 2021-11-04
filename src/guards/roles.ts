import { USER_ROLES_KEY } from '@constants/auth';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLES } from '@prisma/client';

@Injectable()
class UserRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLES[]>(
      USER_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest();

    // req.isAdmin = req.user.role === USER_ROLES.ADMIN;
    // req.isMember = req.user.role === USER_ROLES.MEMBER;

    // return requiredRoles.some((role) => req.user.type === role);
    return requiredRoles.some((role) => {
      if (req.isAdmin) {
        return role === USER_ROLES.ADMIN;
      } else {
        return role === USER_ROLES.MEMBER;
      }
    });
  }
}

export default UserRolesGuard;

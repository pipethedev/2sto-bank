import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VerificationStatus } from '@enum/auth';
import { VERIFICATION_KEY } from '@constants/auth';

@Injectable()
class VerificationAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const status = this.reflector.getAllAndOverride<VerificationStatus>(
      VERIFICATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (status === null || status === undefined) return true;

    const req = context.switchToHttp().getRequest();

    if (req.isAdmin) return true;

    return !!(
      status === VerificationStatus.VERIFIED && req.user.email_verified_at
    );
  }
}

export default VerificationAccessGuard;

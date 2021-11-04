import { SetMetadata } from '@nestjs/common';
import { VerificationStatus } from '@enum/auth';
import { USER_ROLES_KEY, VERIFICATION_KEY } from '@constants/auth';
import { USER_ROLES } from '@prisma/client';

export const VerificationAccess = (status: VerificationStatus) =>
  SetMetadata(VERIFICATION_KEY, status);

export const UserRoles = (...roles: USER_ROLES[]) =>
  SetMetadata(USER_ROLES_KEY, roles);

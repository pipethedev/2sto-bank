import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import AdminUserService from '@admin_user/service';
import AuthGuard from '@guards/auth';
import VerificationAccessGuard from '@guards/verification';
import { VerificationAccess } from '@utils/decorators/auth';
import { VerificationStatus } from '@enum/auth';

@Controller('/admin-user')
@UseGuards(AuthGuard, VerificationAccessGuard)
@VerificationAccess(VerificationStatus.VERIFIED)
class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get('/:uid')
  async getByAdminUser(@Param('uid') uid: string) {
    return await this.adminUserService.getByUID(uid);
  }

  @Post('/check-auth')
  async checkAuth(@Req() req: any) {
    return {
      user: req.user,
    };
  }
}

export default AdminUserController;

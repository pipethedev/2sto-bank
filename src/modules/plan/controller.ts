import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Param,
  Post,
  UseGuards,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { PlanDto } from '@plan/dto';
import PlanService from '@plan/service';
import AuthGuard from '@guards/auth';
import VerificationAccessGuard from '@guards/verification';
import { VerificationStatus } from '@enum/auth';
import { UserRoles, VerificationAccess } from '@utils/decorators/auth';
import { USER_ROLES } from '@prisma/client';
import UserRolesGuard from '@guards/roles';

@Controller('/plan')
@UseGuards(AuthGuard, VerificationAccessGuard, UserRolesGuard)
@VerificationAccess(VerificationStatus.VERIFIED)
class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('/create')
  @UserRoles(USER_ROLES.MEMBER)
  async create(@Body() body: PlanDto, @Req() req: any) {
    try {
      return await this.planService.create(body, req.user.uid);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //fetch all plans
  @Get('/all')
  @UserRoles(USER_ROLES.MEMBER)
  async getAll(@Req() req: any) {
    try {
      return await this.planService.getByUser(req.user.uid);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/:userId')
  @UserRoles(USER_ROLES.MEMBER)
  async getByUser(@Param('userId') userId: string) {
    try {
      return await this.planService.getByUser(userId);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Put('/:uid')
  async update(@Param('uid') uid: string, @Body() body: Partial<PlanDto>) {
    try {
      return this.planService.update(uid, body);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete('/:uid')
  async delete(@Param('uid') uid: string) {
    try {
      return this.planService.delete(uid);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}

export default PlanController;

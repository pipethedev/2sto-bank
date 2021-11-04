import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import BeneficiaryService from '@beneficiary/service';
import { BeneficiaryDto } from '@beneficiary/dto';
import AuthGuard from '@guards/auth';
import VerificationAccessGuard from '@guards/verification';
import { VerificationStatus } from '@enum/auth';
import { UserRoles, VerificationAccess } from '@utils/decorators/auth';
import { USER_ROLES } from '@prisma/client';

@Controller('/beneficiary')
@UseGuards(AuthGuard, VerificationAccessGuard)
@VerificationAccess(VerificationStatus.VERIFIED)
class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  @Post('/create')
  @UserRoles(USER_ROLES.MEMBER)
  async create(@Body() body: BeneficiaryDto, @Req() req: any) {
    try {
      return await this.beneficiaryService.createBeneficiary(
        body,
        req.user.uid,
      );
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('/beneficiaries')
  @UserRoles(USER_ROLES.MEMBER)
  async get(@Req() req: any) {
    try {
      return await this.beneficiaryService.fetchBeneficiaries(req.user.uid);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('/:id')
  @UserRoles(USER_ROLES.MEMBER)
  async getSingle(@Param('id') id: string, @Req() req: any) {
    try {
      return await this.beneficiaryService.single(id, req.user.uid);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('beneficiary/:id')
  @UserRoles(USER_ROLES.MEMBER)
  async remove(@Param('id') id: string) {
    try {
      return await this.beneficiaryService.deleteBeneficiary(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}

export default BeneficiaryController;

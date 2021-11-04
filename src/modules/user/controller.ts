import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  NotAcceptableException,
  Patch,
} from '@nestjs/common';
import UserService from '@user/service';
import {
  AssignUserDto,
  CreateUserDto,
  DeleteBatchUserDto,
  UpdateEMail,
  UpdatePinDto,
} from '@user/dto';
import AuthGuard from '@guards/auth';
import { UserRoles, VerificationAccess } from '@utils/decorators/auth';
import { VerificationStatus } from '@enum/auth';
import VerificationAccessGuard from '@guards/verification';
import { User, USER_ROLES, USER_STATUS } from '@prisma/client';
import { omit } from '@utils/app';
import { userExcludeArray } from '@constants/prisma';
import { exportToCsv } from '@utils/csv';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { verify, encrypt } from '@utils/bcrypt';

@Controller('/users')
@UseGuards(AuthGuard, VerificationAccessGuard)
@VerificationAccess(VerificationStatus.VERIFIED)
class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @UserRoles(USER_ROLES.ADMIN)
  async getPaginationUsers(@Query() query: any) {
    return await this.userService.paginateUsers(query);
  }

  @Get('/:userId')
  @UserRoles(USER_ROLES.ADMIN, USER_ROLES.MEMBER)
  async getUser(@Param('userId') userId: string, @Req() req: any) {
    const user = await this.userService.getUserById(userId);

    return omit<User>(user, req.isAdmin ? ['id'] : userExcludeArray);
  }

  @Get('/:userId/details')
  @UserRoles(USER_ROLES.ADMIN)
  async getUserDetails(@Param('userId') userId: string, @Req() req: any) {
    const { id, ...user } = await this.userService.getUserDetails(userId);

    return user;
  }

  @Post('/')
  @UserRoles(USER_ROLES.ADMIN)
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.userService.createUser(body);

    return omit<User>(user, ['id']);
  }

  @Patch('/:userId')
  @UserRoles(USER_ROLES.ADMIN)
  async updateUser(
    @Param('userId') userId: string,
    @Body() body: Partial<CreateUserDto>,
  ) {
    const updatedUser = await this.userService.updateUserFromAdmin(
      userId,
      body,
    );

    return omit<User>(updatedUser, ['id']);
  }

  @Put('/')
  @UserRoles(USER_ROLES.ADMIN, USER_ROLES.MEMBER)
  async updateMe(
    @Req() req: any,
    @Body() body: Partial<{ firstname: string; lastname: string }>,
  ) {
    const updatedUser = await this.userService.updateUserByUID(
      req.user.uid,
      body,
    );

    return omit<User>(updatedUser, req.isAdmin ? ['id'] : userExcludeArray);
  }

  @Put('/notification/:token')
  @UserRoles(USER_ROLES.ADMIN, USER_ROLES.MEMBER)
  async updateNotification(@Req() req: any) {
    const body = {
      notification_token: req.body.notification_token,
    };
    const updatedUser = await this.userService.updateUserByUID(
      req.user.uid,
      body,
    );

    return omit<User>(updatedUser, req.isAdmin ? ['id'] : userExcludeArray);
  }

  @Patch('/transaction-pin')
  @UserRoles(USER_ROLES.MEMBER, USER_ROLES.ADMIN)
  async updateTransactionPin(@Body() body: UpdatePinDto, @Req() req: any) {
    const user = await this.userService.getUserById(req.user.uid);
    const check = await verify(body.old_pin, user.pin);
    if (!check) {
      throw new NotAcceptableException('Your old pin does not match');
    }
    const data = {
      pin: await encrypt(body.new_pin),
    };
    console.log(req.user.uid);
    const updatedUser = await this.userService.update(req.user.uid, data);

    return omit<User>(updatedUser, req.isAdmin ? ['id'] : userExcludeArray);
  }

  @Put('/update-profile-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  async updateProfileImage(
    @Req() req: any,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.userService.updateUserProfileImage(req.user.uid, image);
  }

  @Put('/update-mail')
  @UserRoles(USER_ROLES.ADMIN, USER_ROLES.MEMBER)
  async updateMail(@Req() req: any, @Body() body: UpdateEMail) {
    const updatedUser = await this.userService.updateEMail(req.user.uid, body);
    return omit<User>(updatedUser, req.isAdmin ? ['id'] : userExcludeArray);
  }
  //Account statement for a user
  @Post('/export/account-statement')
  @UserRoles(USER_ROLES.MEMBER)
  async exportStatement(@Query() query: any, @Req() req: any) {
    const users = await this.userService.getAllUsers(query);
    const filename = await exportToCsv(users);
    // TODO: delete file after download
    return { url: `${req.protocol}://${req.get('host')}/reports/${filename}` };
  }

  @Post('/export/account-statement/:userId')
  @UserRoles(USER_ROLES.MEMBER)
  async export(@Query() query: any, @Req() req: any) {
    const users = await this.userService.getAllUsers(query);
    const filename = await exportToCsv(users);
    // TODO: delete file after download
    return { url: `${req.protocol}://${req.get('host')}/reports/${filename}` };
  }

  //Assign roles to users
  @Put('/roles/assign')
  @UserRoles(USER_ROLES.ADMIN)
  async assignRole(@Body() body: AssignUserDto, @Req() req: any) {
    const assign = await this.userService.assignRoleToUser(body);

    return omit<User>(assign, req.isAdmin ? ['id'] : userExcludeArray);
  }

  @Delete('/:userId')
  @UserRoles(USER_ROLES.ADMIN)
  async deleteUser(@Param('userId') userId: string) {
    return await this.userService.deleteUserByUID(userId);
  }

  // ---------------------- Admin ------------------------------

  @Post('/export')
  @UserRoles(USER_ROLES.ADMIN)
  async exportUser(@Query() query: any, @Req() req: any) {
    const users = await this.userService.getAllUsers(query);
    const filename = await exportToCsv(users);
    // TODO: delete file after download
    return { url: `${req.protocol}://${req.get('host')}/reports/${filename}` };
  }

  @Delete('/')
  @UserRoles(USER_ROLES.ADMIN)
  async batchDelete(@Body() body: DeleteBatchUserDto) {
    return await this.userService.updateStatus(body.users, USER_STATUS.DELETED);
  }

  @Post('/:userId/export')
  @UserRoles(USER_ROLES.ADMIN)
  async exportSingleUser(
    @Query() query: any,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const q = { ...query, uid: userId };
    const users = await this.userService.getAllUsers(q);
    const filename = await exportToCsv(users);
    // TODO: delete file after download
    return { url: `${req.protocol}://${req.get('host')}/reports/${filename}` };
  }

  // @Delete('/delete-all')
  // @UserRoles(USER_ROLES.ADMIN)
  // async deleteAll() {
  //   return await this.userService.deleteAll();
  // }
  // @Post('/:userId/update-status/:status')
  // async updateStatus(
  //   @Param('userId') userId: string,
  //   @Param('status') status: USER_STATUS,
  // ) {
  //   //return await this.userService.updateStatus([userId], status);
  // }
}

export default UserController;

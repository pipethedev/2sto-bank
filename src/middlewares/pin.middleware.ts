import UserService from '@user/service';
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  Req,
} from '@nestjs/common';
import { compare } from 'bcryptjs';
import { Request, NextFunction } from 'express';
import { retrieveTokenValue } from '@utils/jwt';

@Injectable()
class PinMiddleware implements NestMiddleware {
  constructor(private readonly authService: UserService) {}
  async use(@Req() req: Request, next: NextFunction) {
    const token = req.headers.authorization.split(' ')[1];
    const { id } = await retrieveTokenValue(token);
    //Ensure user provides a valid transaction pin on making request
    const user = await this.authService.getUserById(id);
    const pin =
      typeof req.body.pin == 'undefined' || null || '' ? '' : req.body.pin;
    const verify =
      typeof req.body.bio == 'undefined' || null || ''
        ? await compare(pin, user.pin)
        : await this.authService.getUserByBiometrics(req.body.bio);
    //const verify = false;
    if (verify == false) {
      throw new BadRequestException('Invalid pin, please check again!');
    }
    next();
  }
}

export default PinMiddleware;

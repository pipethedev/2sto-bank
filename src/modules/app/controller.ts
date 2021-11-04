import {
  Controller,
  Get,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import AppService from './service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/send')
  async send() {
    try {
      await this.mailService.sendMail({
        to: 'davmuri1414@gmail.com',
        from: 'media@2sto.co',
        subject: 'Test Subject',
        template: './verify',
        context: {
          name: 'Muritala David',
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
  //webhook meant to be here
}

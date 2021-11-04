import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendMail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        from: 'noreply@nestjs.com',
        subject,
        template,
        context,
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async sendAccountVerificationEmail(to: string, token: string, name: string) {
    const verifyURL = `${process.env.APP_BASE_URL}:${process.env.APP_PORT}/auth/verify-email/${token}`;

    await this.sendMail(
      to,
      'Verify your account',
      './verify',
      JSON.stringify({ name, verifyURL }),
    );
  }

  async sendResetPasswordEmail(
    resetToken: string,
    email: string,
    name: string,
  ) {
    const resetURL = `${process.env.APP_BASE_URL}:${process.env.APP_PORT}/auth/reset-password/${resetToken}`;

    await this.sendMail(
      email,
      'Reset your account password',
      './reset',
      JSON.stringify({ name, resetURL }),
    );
  }

  async sendUpdatedMail(fullname: string, email: string, code: string) {
    await this.sendMail(
      email,
      'Account Update',
      './reset',
      JSON.stringify({ fullname, code }),
    );
  }
}

export default MailService;

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SNS } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';
import { createHash, randomBytes } from 'crypto';
import UserService from '@user/service';
import { encrypt } from '@utils/bcrypt';
import { UserBuidObj } from '@interface/entities';

@Injectable()
class OTPService {
  constructor(
    @InjectAwsService(SNS) private readonly sns: SNS,
    private readonly authService: UserService,
  ) {}

  async sendOTP(otp: number, phone: string, data: UserBuidObj) {
    try {
      const params = {
        Message: `Your one time 2sto OTP Verification code is ${otp}`,
        PhoneNumber: '+2348109275459', //phone,
        Subject: 'Verification',
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: '2STO',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      };
      const otpVerifyToken = await encrypt(otp.toString());
      const result = await this.sns.publish(params).promise();
      const user = await this.authService.createSemiUser(otpVerifyToken, data);
      return {
        token: otpVerifyToken,
        user,
        result,
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}

export default OTPService;

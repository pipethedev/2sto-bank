import { Module } from '@nestjs/common';
import AppModule from '@app/module';
import AuthModule from '@auth/module';
import AdminUserModule from '@admin_user/module';
import UserModule from '@user/module';
import MailModule from '@mail/module';
import PlanModule from '@plan/module';
import { AwsSdkModule } from 'nest-aws-sdk';
import { MulterModule } from '@nestjs/platform-express';
import { SNS, S3 } from 'aws-sdk';
import AccountModule from '@account/module';
import BeneficiaryModule from '@beneficiary/module';
import DebitCardModule from '@debit/module';
import TransactionModule from '@transaction/module';
import VirtualCardModule from '@card/module';
import { FirebaseAdminModule } from '@aginix/nestjs-firebase-admin';
import * as admin from 'firebase-admin';

@Module({
  imports: [
    AppModule,
    AuthModule,
    UserModule,
    AdminUserModule,
    MailModule,
    AccountModule,
    PlanModule,
    BeneficiaryModule,
    DebitCardModule,
    VirtualCardModule,
    TransactionModule,
    FirebaseAdminModule.forRootAsync({
      useFactory: () => ({
        credential: admin.credential.applicationDefault(),
      }),
    }),
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
        correctClockSkew: true,
      },
      services: [SNS, S3],
    }),
    MulterModule.register({
      dest: './files',
      limits: {
        fileSize: 1 * 1024 * 1024,
      },
    }),
  ],
  providers: [],
})
export default class Modules {}

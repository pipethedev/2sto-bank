import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
class StorageService {
  constructor(@InjectAwsService(S3) private readonly storage: S3) {}
  async newUserProfileAttachment(user: string, file: Express.Multer.File) {
    return await this.storage
      .upload({
        Bucket: process.env.USER_PROFILE_IMAGE_ATTACHMENT_BUCKET,
        Key: `${user}/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
      })
      .promise();
  }
}

export default StorageService;

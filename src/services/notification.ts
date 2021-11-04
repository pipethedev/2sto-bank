import UserService from '@modules/user/service';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { FirebaseMessagingService } from '@aginix/nestjs-firebase-admin';

@Injectable()
class NotificationService {
  constructor(
    private readonly firebase: FirebaseMessagingService,
    private readonly userService: UserService,
  ) {}

  async send(id: string): Promise<any> {
    try {
      const { notification_token } = await this.userService.getUserById(id);
      //await this.firebase.messaging.sendToDevice();
    } catch (e) {
      throw new ServiceUnavailableException(e.message);
    }
  }
}

export default NotificationService;

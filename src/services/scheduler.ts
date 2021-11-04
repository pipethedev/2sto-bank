import { HttpException, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import AccountService from '@account/service';
import { TransferDto } from '@account/dto';
import { generateToken } from '@utils/randomizer';

@Injectable()
export default class ScheduleService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly accountService: AccountService,
  ) {}

  async scheduleTransfer(transfer: TransferDto, user_id: string) {
    try {
      const date = new Date(transfer.schedule_date);
      const job = new CronJob(date, async () => {
        await this.accountService.transfer(transfer, user_id);
      });

      this.schedulerRegistry.addCronJob(
        `${Date.now()}-${generateToken()}`,
        job,
      );
      job.start();
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
}

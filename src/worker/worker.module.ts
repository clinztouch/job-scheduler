import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  imports: [SchedulerModule],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerModule {}
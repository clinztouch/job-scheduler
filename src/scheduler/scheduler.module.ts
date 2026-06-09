import { Module } from '@nestjs/common';
import { HeapService } from './heap.service';
import { TimingWheelService } from './timing-wheel.service';
import { AgingService } from './aging.service';
import { SchedulerController } from './scheduler.controller';

@Module({
  controllers: [SchedulerController],
  providers: [HeapService, TimingWheelService, AgingService],
  exports: [HeapService, TimingWheelService],
})
export class SchedulerModule {}
import { Module } from '@nestjs/common';
import { DlqService } from './dlq.service';
import { DlqController } from './dlq.controller'; 

@Module({
  controllers: [DlqController],
  providers: [DlqService],
})
export class DlqModule {}
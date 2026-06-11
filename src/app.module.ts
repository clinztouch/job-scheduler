import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AppLoggerModule } from './logger/logger.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { WorkerModule } from './worker/worker.module';
import { HandlersModule } from './handlers/handlers.module';
import { RetryModule } from './retry/retry.module';
import { DlqModule } from './dlq/dlq.module';
import { SseModule } from './sse/sse.module';

const isWorkerOnly = process.env.WORKER_ONLY === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AppLoggerModule,
    SchedulerModule,
    HandlersModule,
    RetryModule,
    DlqModule,
    // API-only modules — not needed in worker process
    ...(isWorkerOnly ? [] : [JobsModule, SseModule]),
    // Worker only loads in worker process
    ...(isWorkerOnly ? [WorkerModule] : []),
  ],
  controllers: [...(isWorkerOnly ? [] : [AppController])],
  providers: [AppService],
})
export class AppModule {}
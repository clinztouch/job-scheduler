import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { AppLoggerModule } from '../logger/logger.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { WorkerModule } from './worker.module';
import { HandlersModule } from '../handlers/handlers.module';
import { RetryModule } from '../retry/retry.module';
import { DlqModule } from '../dlq/dlq.module';
import { Logger } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AppLoggerModule,
    SchedulerModule,
    WorkerModule,
    HandlersModule,
    RetryModule,
    DlqModule,
  ],
})
class WorkerAppModule {}

async function bootstrapWorker() {
  const app = await NestFactory.create(WorkerAppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  await app.init();
  console.log('Worker process started — no HTTP server');
}

bootstrapWorker();
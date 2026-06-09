import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobStatus } from '@prisma/client';
import type { Job } from '@prisma/client';

const DLQ_THRESHOLD = parseInt(process.env.DLQ_ALERT_THRESHOLD ?? '10');

@Injectable()
export class DlqService {
  private readonly logger = new Logger(DlqService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('job.dlq')
  async onJobMovedToDlq(job: Job) {
    this.logger.error(`Job entered DLQ | id=${job.id} type=${job.type} error=${job.errorMessage}`);
    await this.checkThreshold();
  }

  private async checkThreshold() {
    const count = await this.prisma.job.count({ where: { isDlq: true } });

    if (count >= DLQ_THRESHOLD) {
      this.logger.error(
        `DLQ ALERT: threshold reached | count=${count} threshold=${DLQ_THRESHOLD}`,
      );
      // In production this would send an email — mocked here as a log
      this.simulateAlertEmail(count);
    }
  }

  private simulateAlertEmail(count: number) {
    this.logger.warn(
      `[MOCK ALERT EMAIL] To: ops@dilamme.com | Subject: DLQ threshold breached | DLQ job count is ${count}, threshold is ${DLQ_THRESHOLD}. Immediate investigation required.`,
    );
  }

  async findAll() {
    return this.prisma.job.findMany({
      where: { isDlq: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async manualRetry(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });

    if (!job) throw new NotFoundException(`Job ${id} not found`);
    if (!job.isDlq) throw new NotFoundException(`Job ${id} is not in the DLQ`);

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: JobStatus.PENDING,
        retryCount: 0,
        isDlq: false,
        errorMessage: null,
        scheduledAt: null,
      },
    });

    this.logger.log(`Manual DLQ retry | id=${id}`);
    this.eventEmitter.emit('job.updated', updated);
    this.eventEmitter.emit('job.readmit', updated);

    return updated;
  }
}
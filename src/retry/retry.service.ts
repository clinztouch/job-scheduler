import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobStatus } from '@prisma/client';
import type { JobFailedPayload } from '../common/types/job.types';

const MAX_RETRIES = 3;

// Backoff with jitter
// Attempt 1 → ~1s, Attempt 2 → ~5s, Attempt 3 → ~25s
function getBackoffMs(attempt: number): number {
  const base = Math.pow(5, attempt - 1) * 1000;
  const jitter = Math.random() * 500;
  return base + jitter;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('job.failed')
  async handleFailure(payload: JobFailedPayload) {
    const { job, error } = payload;

    const fresh = await this.prisma.job.findUnique({ where: { id: job.id } });
    if (!fresh) return;

    // If job was cancelled, don't retry
    if (fresh.status === JobStatus.CANCELLED) {
      this.logger.log(`Job ${job.id} was cancelled — skipping retry`);
      return;
    }

    const newRetryCount = fresh.retryCount + 1;

    if (newRetryCount <= MAX_RETRIES) {
      const backoffMs = getBackoffMs(newRetryCount);

      const updated = await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.PENDING,
          retryCount: newRetryCount,
          errorMessage: error,
          scheduledAt: new Date(Date.now() + backoffMs),
        },
      });

      this.logger.warn(
        `Retry scheduled | id=${job.id} attempt=${newRetryCount} backoff=${Math.round(backoffMs)}ms`,
      );

      this.eventEmitter.emit('job.updated', updated);
      this.eventEmitter.emit('job.retry', { job: updated, attempt: newRetryCount });

      // Re-admit to timing wheel after backoff
      setTimeout(() => {
        this.eventEmitter.emit('job.readmit', updated);
      }, backoffMs);
    } else {
      // Exhausted all retries — move to DLQ
      const updated = await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          retryCount: newRetryCount,
          errorMessage: error,
          isDlq: true,
        },
      });

      this.logger.error(`Job moved to DLQ | id=${job.id} error=${error}`);
      this.eventEmitter.emit('job.updated', updated);
      this.eventEmitter.emit('job.dlq', updated);
    }
  }
}
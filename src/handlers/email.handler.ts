import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobStatus } from '@prisma/client';
import type { Job } from '@prisma/client';

const FAILURE_RATE = 0.3;

@Injectable()
export class EmailHandler {
  private readonly logger = new Logger(EmailHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('job.execute')
  async handle(job: Job) {
    if (job.type !== 'send_email') return;

    this.logger.log(`Executing email job | id=${job.id} payload=${JSON.stringify(job.payload)}`);

    try {
  await this.simulateEmailSend(job.payload as Record<string, string>);

  // Check if job was cancelled during processing
  const current = await this.prisma.job.findUnique({
    where: { id: job.id },
    select: { status: true },
  });

  if (current?.status === JobStatus.CANCELLED) {
    this.logger.warn(`Job cancelled during processing | id=${job.id} — skipping COMPLETED`);
    return;
  }

  const updated = await this.prisma.job.update({
    where: { id: job.id },
    data: { status: JobStatus.COMPLETED },
  });
  // ... rest stays the same

      this.logger.log(`Job completed | id=${job.id}`);
      this.eventEmitter.emit('job.completed', updated);
      this.eventEmitter.emit('job.updated', updated);

      // Handle recurring jobs
      if (job.interval) {
        const intervalMs = this.getIntervalMs(job.interval);
        const nextRun = new Date(Date.now() + intervalMs);

        const nextJob = await this.prisma.job.create({
          data: {
            type: job.type,
            payload: job.payload ?? {},
            priority: job.priority,
            interval: job.interval,
            scheduledAt: nextRun,
            effectivePriority: job.priority,
          },
        });

        this.logger.log(`Recurring job scheduled | id=${nextJob.id} nextRun=${nextRun.toISOString()}`);
        this.eventEmitter.emit('job.readmit', nextJob);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Job failed | id=${job.id} error=${message}`);
      this.eventEmitter.emit('job.failed', { job, error: message });
    }
  }

  private async simulateEmailSend(payload: Record<string, string>) {
    const latency = 200 + Math.random() * 800;
    await new Promise((r) => setTimeout(r, latency));

    if (!payload?.to || !payload?.subject) {
      throw new Error('Invalid email payload: missing "to" or "subject"');
    }

    if (Math.random() < FAILURE_RATE) {
      throw new Error(`SMTP connection timeout sending to ${payload.to}`);
    }

    this.logger.log(
      `[MOCK EMAIL SENT] to=${payload.to} subject="${payload.subject}" body="${payload.body ?? '(no body)'}"`,
    );
  }

  private getIntervalMs(interval: string): number {
    switch (interval) {
      case 'every_1_minute':  return 60 * 1000;
      case 'every_5_minutes': return 5 * 60 * 1000;
      case 'every_1_hour':    return 60 * 60 * 1000;
      default: return 60 * 1000;
    }
  }
}
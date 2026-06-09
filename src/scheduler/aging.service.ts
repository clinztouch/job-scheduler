import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { HeapService } from './heap.service';
import { JobStatus } from '@prisma/client';

// Starvation prevention config
// Jobs waiting longer than AGING_THRESHOLD_SECONDS get their effective priority boosted
// AGING_BOOST_AMOUNT is subtracted from effectivePriority (lower = higher priority in heap)
// Example: a priority=3 (low) job waiting 30s gets boosted to 2.5, then 2.0, etc.
const AGING_THRESHOLD_SECONDS = parseInt(process.env.AGING_INTERVAL_SECONDS ?? '30');
const AGING_BOOST = parseFloat(process.env.AGING_BOOST_AMOUNT ?? '0.5');

@Injectable()
export class AgingService {
  private readonly logger = new Logger(AgingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly heap: HeapService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async applyAging() {
    const threshold = new Date(Date.now() - AGING_THRESHOLD_SECONDS * 1000);

    const starvingJobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.PENDING,
        isDlq: false,
        createdAt: { lte: threshold },
        effectivePriority: { gt: 1 },
      },
    });

    if (starvingJobs.length === 0) return;

    for (const job of starvingJobs) {
      const newPriority = Math.max(1, job.effectivePriority - AGING_BOOST);

      await this.prisma.job.update({
        where: { id: job.id },
        data: { effectivePriority: newPriority },
      });

      this.heap.updatePriority(job.id, newPriority);

      this.logger.log(
        `Aging applied | jobId=${job.id} oldPriority=${job.effectivePriority} newPriority=${newPriority}`,
      );
    }

    this.logger.log(`Aging run complete | ${starvingJobs.length} jobs boosted`);
  }
}
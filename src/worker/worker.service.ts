import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JobStatus, type Job } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HeapService } from '../scheduler/heap.service';
import { TimingWheelService } from '../scheduler/timing-wheel.service';

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 2000);

@Injectable()
export class WorkerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(WorkerService.name);
  private poller: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private started = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly heap: HeapService,
    private readonly timingWheel: TimingWheelService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

async onApplicationBootstrap() {
  if (this.started) return;
  this.started = true;

  await this.loadPendingJobsIntoHeap();
  this.logger.log(`Scheduler bootstrap completed`);
  
  // Poll DB for new jobs every 5 seconds
  setInterval(() => void this.loadPendingJobsIntoHeap(), 5000);
  
  this.poller = setInterval(() => void this.poll(), POLL_INTERVAL_MS);
  this.logger.log(`Worker started | pollInterval=${POLL_INTERVAL_MS}ms`);
}

  onModuleDestroy() {
    if (this.poller) {
      clearInterval(this.poller);
      this.poller = null;
    }
  }

  @OnEvent('job.readmit')
  async onReadmit(job: Job) {
    await this.admitToHeap(job.id);
    this.logger.log(`Job readmitted | id=${job.id} status=PENDING`);
  }

  @OnEvent('job.created')
  async onJobCreated(job: Job) {
    await this.admitToHeap(job.id);
    this.logger.log(
      `Job admitted | id=${job.id} type=${job.type} priority=${job.priority}`,
    );
  }

  @OnEvent('job.completed')
  async onJobCompleted(job: Job) {
    const dependents = await this.prisma.jobDependency.findMany({
      where: { dependsOnId: job.id },
      include: {
        job: {
          include: { dependencies: { include: { dependsOn: true } } },
        },
      },
    });

    for (const dep of dependents) {
      const allDone = dep.job.dependencies.every(
        (d) => d.dependsOn.status === JobStatus.COMPLETED,
      );
      if (allDone) {
        this.logger.log(`DAG unblocked | id=${dep.job.id} type=${dep.job.type}`);
        await this.admitToHeap(dep.job.id);
      }
    }
  }

  private async loadPendingJobsIntoHeap() {
    const now = new Date();

    const dueJobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.PENDING,
        isDlq: false,
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
      },
    });

    for (const job of dueJobs) {
      const deps = await this.prisma.jobDependency.findMany({
        where: { jobId: job.id },
        include: { dependsOn: true },
      });

      const allDepsDone = deps.every((d) => d.dependsOn.status === JobStatus.COMPLETED);
      if (deps.length === 0 || allDepsDone) {
        this.heap.push({
          id: job.id,
          effectivePriority: job.effectivePriority,
          scheduledAt: job.scheduledAt,
          createdAt: job.createdAt,
        });
      }
    }

    const futureJobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.PENDING,
        isDlq: false,
        scheduledAt: { gt: now },
      },
    });

    for (const job of futureJobs) {
      this.timingWheel.schedule({
        jobId: job.id,
        effectivePriority: job.effectivePriority,
        scheduledAt: job.scheduledAt!,
        createdAt: job.createdAt,
      });
    }

    this.logger.log(
      `Scheduler bootstrap | dueJobs=${dueJobs.length} futureJobs=${futureJobs.length}`,
    );
  }

  private async poll() {
    if (this.isProcessing || this.heap.isEmpty()) return;
    this.isProcessing = true;

    try {
      const next = this.heap.peek();
      if (!next) return;

      const result = await this.prisma.job.updateMany({
        where: { id: next.id, status: JobStatus.PENDING },
        data: { status: JobStatus.PROCESSING },
      });

      if (result.count === 0) {
        this.heap.remove(next.id);
        return;
      }

      this.heap.remove(next.id);

      const lockedJob = await this.prisma.job.findUnique({ where: { id: next.id } });
      if (!lockedJob) return;

      this.logger.log(
        `Job started | id=${lockedJob.id} type=${lockedJob.type} priority=${lockedJob.priority}`,
      );
      this.eventEmitter.emit('job.started', lockedJob);
      this.eventEmitter.emit('job.updated', {
        ...lockedJob,
        status: JobStatus.PROCESSING,
      });
      this.eventEmitter.emit('job.execute', lockedJob);
    } finally {
      this.isProcessing = false;
    }
  }

  async admitToHeap(jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== JobStatus.PENDING) return;

    if (job.scheduledAt && job.scheduledAt > new Date()) {
      this.timingWheel.schedule({
        jobId: job.id,
        effectivePriority: job.effectivePriority,
        scheduledAt: job.scheduledAt,
        createdAt: job.createdAt,
      });
    } else {
      this.heap.push({
        id: job.id,
        effectivePriority: job.effectivePriority,
        scheduledAt: job.scheduledAt,
        createdAt: job.createdAt,
      });
    }
  }
}
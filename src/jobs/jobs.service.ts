import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobDto } from './dto/query-jobs.dto'; 
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateJobDto) {
    const { dependsOn, scheduledAt, ...rest } = dto;

    if (dependsOn?.length) {
      const found = await this.prisma.job.findMany({
        where: { id: { in: dependsOn } },
        select: { id: true },
      });
      if (found.length !== dependsOn.length) {
        throw new BadRequestException('One or more dependency job IDs do not exist');
      }
    }

    const job = await this.prisma.job.create({
      data: {
        ...rest,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        effectivePriority: rest.priority,
        dependencies: dependsOn?.length
          ? { create: dependsOn.map((depId) => ({ dependsOnId: depId })) }
          : undefined,
      },
      include: { dependencies: true },
    });

    this.logger.log(`Job created | id=${job.id} type=${job.type} priority=${job.priority}`);
    this.eventEmitter.emit('job.created', job);

    return job;
  }

  async findAll(query: QueryJobDto) {
    return this.prisma.job.findMany({
      where: {
        status: query.status as JobStatus | undefined,
        isDlq: false,
      },
      include: { dependencies: true, dependents: true },
      orderBy: [{ effectivePriority: 'asc' }, { scheduledAt: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { dependencies: true, dependents: true },
    });
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }

  async cancel(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Job ${id} not found`);

    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
      throw new BadRequestException(`Cannot cancel a job with status ${job.status}`);
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: { status: JobStatus.CANCELLED },
    });

    this.logger.log(`Job cancelled | id=${id}`);
    this.eventEmitter.emit('job.updated', updated);

    return updated;
  }

  async getDashboardCounts() {
    const [pending, processing, completed, failed, cancelled, dlq] = await Promise.all([
      this.prisma.job.count({ where: { status: JobStatus.PENDING, isDlq: false } }),
      this.prisma.job.count({ where: { status: JobStatus.PROCESSING } }),
      this.prisma.job.count({ where: { status: JobStatus.COMPLETED } }),
      this.prisma.job.count({ where: { status: JobStatus.FAILED, isDlq: false } }),
      this.prisma.job.count({ where: { status: JobStatus.CANCELLED } }),
      this.prisma.job.count({ where: { isDlq: true } }),
    ]);

    return { pending, processing, completed, failed, cancelled, dlq };
  }
}
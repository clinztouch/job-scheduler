import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HeapService } from '../scheduler/heap.service';
import { TimingWheelService } from '../scheduler/timing-wheel.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Job } from '@prisma/client';
export declare class WorkerService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly heap;
    private readonly timingWheel;
    private readonly eventEmitter;
    private readonly logger;
    private poller;
    private isProcessing;
    constructor(prisma: PrismaService, heap: HeapService, timingWheel: TimingWheelService, eventEmitter: EventEmitter2);
    onModuleInit(): void;
    onModuleDestroy(): void;
    onReadmit(job: Job): Promise<void>;
    onJobCreated(job: Job): Promise<void>;
    onJobCompleted(job: Job): Promise<void>;
    private loadPendingJobsIntoHeap;
    private poll;
    admitToHeap(jobId: string): Promise<void>;
}

import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { HeapService } from './heap.service';
export interface ScheduledEntry {
    jobId: string;
    effectivePriority: number;
    scheduledAt: Date;
    createdAt: Date;
}
export declare class TimingWheelService implements OnModuleInit, OnModuleDestroy {
    private readonly heap;
    private readonly logger;
    private wheel;
    private currentSlot;
    private ticker;
    constructor(heap: HeapService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    schedule(entry: ScheduledEntry): void;
    private tick;
    benchmarkVsHeap(jobCount: number): {
        heapMs: number;
        wheelMs: number;
    };
}

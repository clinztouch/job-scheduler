import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Job } from '@prisma/client';
export declare class DlqService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    onJobMovedToDlq(job: Job): Promise<void>;
    private checkThreshold;
    private simulateAlertEmail;
    findAll(): Promise<{
        type: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        priority: number;
        scheduledAt: Date | null;
        interval: string | null;
        status: import("@prisma/client").$Enums.JobStatus;
        id: string;
        retryCount: number;
        nextRunAt: Date | null;
        errorMessage: string | null;
        isDlq: boolean;
        effectivePriority: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    manualRetry(id: string): Promise<{
        type: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        priority: number;
        scheduledAt: Date | null;
        interval: string | null;
        status: import("@prisma/client").$Enums.JobStatus;
        id: string;
        retryCount: number;
        nextRunAt: Date | null;
        errorMessage: string | null;
        isDlq: boolean;
        effectivePriority: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

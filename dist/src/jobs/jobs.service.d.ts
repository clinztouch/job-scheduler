import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobDto } from './dto/query-jobs.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class JobsService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(dto: CreateJobDto): Promise<{
        dependencies: {
            id: string;
            dependsOnId: string;
            jobId: string;
        }[];
    } & {
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
    findAll(query: QueryJobDto): Promise<({
        dependencies: {
            id: string;
            dependsOnId: string;
            jobId: string;
        }[];
        dependents: {
            id: string;
            dependsOnId: string;
            jobId: string;
        }[];
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        dependencies: {
            id: string;
            dependsOnId: string;
            jobId: string;
        }[];
        dependents: {
            id: string;
            dependsOnId: string;
            jobId: string;
        }[];
    } & {
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
    cancel(id: string): Promise<{
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
    getDashboardCounts(): Promise<{
        pending: number;
        processing: number;
        completed: number;
        failed: number;
        cancelled: number;
        dlq: number;
    }>;
}

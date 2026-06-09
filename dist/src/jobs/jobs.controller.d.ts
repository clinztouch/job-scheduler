import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobDto } from './dto/query-jobs.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
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
    getDashboard(): Promise<{
        pending: number;
        processing: number;
        completed: number;
        failed: number;
        cancelled: number;
        dlq: number;
    }>;
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
}

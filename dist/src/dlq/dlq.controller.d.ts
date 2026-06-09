import { DlqService } from './dlq.service';
export declare class DlqController {
    private readonly dlqService;
    constructor(dlqService: DlqService);
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
    retry(id: string): Promise<{
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

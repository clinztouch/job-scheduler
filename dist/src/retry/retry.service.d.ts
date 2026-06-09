import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { JobFailedPayload } from '../common/types/job.types';
export declare class RetryService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    handleFailure(payload: JobFailedPayload): Promise<void>;
}

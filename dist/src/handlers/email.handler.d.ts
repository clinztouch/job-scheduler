import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Job } from '@prisma/client';
export declare class EmailHandler {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    handle(job: Job): Promise<void>;
    private simulateEmailSend;
    private getIntervalMs;
}

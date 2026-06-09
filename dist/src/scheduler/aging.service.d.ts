import { PrismaService } from '../prisma/prisma.service';
import { HeapService } from './heap.service';
export declare class AgingService {
    private readonly prisma;
    private readonly heap;
    private readonly logger;
    constructor(prisma: PrismaService, heap: HeapService);
    applyAging(): Promise<void>;
}

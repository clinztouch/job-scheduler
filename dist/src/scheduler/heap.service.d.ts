export interface HeapJob {
    id: string;
    effectivePriority: number;
    scheduledAt: Date | null;
    createdAt: Date;
}
export declare class HeapService {
    private heap;
    private compare;
    private swap;
    private bubbleUp;
    private bubbleDown;
    push(job: HeapJob): void;
    pop(): HeapJob | undefined;
    peek(): HeapJob | undefined;
    remove(id: string): void;
    updatePriority(id: string, effectivePriority: number): void;
    size(): number;
    isEmpty(): boolean;
}

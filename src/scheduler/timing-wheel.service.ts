import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { HeapService } from './heap.service';

const WHEEL_SIZE = 60; // 60 buckets = 60 seconds resolution

export interface ScheduledEntry {
  jobId: string;
  effectivePriority: number;
  scheduledAt: Date;
  createdAt: Date;
}

@Injectable()
export class TimingWheelService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TimingWheelService.name);
  private wheel: Map<number, ScheduledEntry[]> = new Map();
  private currentSlot = 0;
  private ticker: NodeJS.Timeout | null = null;

  constructor(private readonly heap: HeapService) {
    for (let i = 0; i < WHEEL_SIZE; i++) {
      this.wheel.set(i, []);
    }
  }

  onModuleInit() {
    this.ticker = setInterval(() => this.tick(), 1000);
    this.logger.log('Timing wheel started');
  }

  onModuleDestroy() {
    if (this.ticker) clearInterval(this.ticker);
  }

  schedule(entry: ScheduledEntry) {
    const now = Date.now();
    const delay = Math.max(0, entry.scheduledAt.getTime() - now);
    const slotOffset = Math.floor(delay / 1000) % WHEEL_SIZE;
    const targetSlot = (this.currentSlot + slotOffset) % WHEEL_SIZE;

    this.wheel.get(targetSlot)!.push(entry);
    this.logger.log(
      `Job ${entry.jobId} scheduled in slot ${targetSlot} (delay ~${Math.floor(delay / 1000)}s)`,
    );
  }

  private tick() {
    const entries = this.wheel.get(this.currentSlot) ?? [];

    for (const entry of entries) {
      const now = new Date();
      // Double-check: if job was scheduled for a future time beyond one wheel rotation
      if (entry.scheduledAt > now) {
        // Re-schedule into next rotation
        this.schedule(entry);
        continue;
      }

      this.heap.push({
        id: entry.jobId,
        effectivePriority: entry.effectivePriority,
        scheduledAt: entry.scheduledAt,
        createdAt: entry.createdAt,
      });

      this.logger.log(`Job ${entry.jobId} admitted to heap from timing wheel slot ${this.currentSlot}`);
    }

    // Clear the slot after processing
    this.wheel.set(this.currentSlot, []);
    this.currentSlot = (this.currentSlot + 1) % WHEEL_SIZE;
  }

  benchmarkVsHeap(jobCount: number): { heapMs: number; wheelMs: number } {
    // Benchmark: insert jobCount entries into heap directly vs timing wheel
    const jobs: ScheduledEntry[] = Array.from({ length: jobCount }, (_, i) => ({
      jobId: `bench-${i}`,
      effectivePriority: Math.ceil(Math.random() * 3),
      scheduledAt: new Date(Date.now() + Math.random() * 60000),
      createdAt: new Date(),
    }));

    // Heap benchmark
    const tempHeap = new HeapService();
    const heapStart = performance.now();
    for (const j of jobs) {
      tempHeap.push({ id: j.jobId, effectivePriority: j.effectivePriority, scheduledAt: j.scheduledAt, createdAt: j.createdAt });
    }
    const heapMs = performance.now() - heapStart;

    // Timing wheel benchmark
    const wheelStart = performance.now();
    for (const j of jobs) {
      this.schedule(j);
    }
    const wheelMs = performance.now() - wheelStart;

    this.logger.log(`Benchmark (${jobCount} jobs) — Heap: ${heapMs.toFixed(3)}ms | Wheel: ${wheelMs.toFixed(3)}ms`);

    return { heapMs, wheelMs };
  }
}
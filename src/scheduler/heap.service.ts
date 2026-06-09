import { Injectable } from '@nestjs/common';

export interface HeapJob {
  id: string;
  effectivePriority: number;
  scheduledAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class HeapService {
  private heap: HeapJob[] = [];

  private compare(a: HeapJob, b: HeapJob): boolean {
    if (a.effectivePriority !== b.effectivePriority) {
      return a.effectivePriority < b.effectivePriority;
    }
    const aTime = a.scheduledAt?.getTime() ?? a.createdAt.getTime();
    const bTime = b.scheduledAt?.getTime() ?? b.createdAt.getTime();
    if (aTime !== bTime) return aTime < bTime;
    return a.createdAt.getTime() < b.createdAt.getTime();
  }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parent])) {
        this.swap(index, parent);
        index = parent;
      } else break;
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.compare(this.heap[left], this.heap[smallest])) {
        smallest = left;
      }
      if (right < length && this.compare(this.heap[right], this.heap[smallest])) {
        smallest = right;
      }
      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else break;
    }
  }

  push(job: HeapJob) {
    this.heap.push(job);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): HeapJob | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  peek(): HeapJob | undefined {
    return this.heap[0];
  }

  remove(id: string) {
    const index = this.heap.findIndex((j) => j.id === id);
    if (index === -1) return;
    this.heap.splice(index, 1);
    // rebuild heap after removal
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  updatePriority(id: string, effectivePriority: number) {
    const job = this.heap.find((j) => j.id === id);
    if (!job) return;
    job.effectivePriority = effectivePriority;
    // rebuild heap after update
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }
}
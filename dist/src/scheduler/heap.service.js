"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeapService = void 0;
const common_1 = require("@nestjs/common");
let HeapService = class HeapService {
    heap = [];
    compare(a, b) {
        if (a.effectivePriority !== b.effectivePriority) {
            return a.effectivePriority < b.effectivePriority;
        }
        const aTime = a.scheduledAt?.getTime() ?? a.createdAt.getTime();
        const bTime = b.scheduledAt?.getTime() ?? b.createdAt.getTime();
        if (aTime !== bTime)
            return aTime < bTime;
        return a.createdAt.getTime() < b.createdAt.getTime();
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parent])) {
                this.swap(index, parent);
                index = parent;
            }
            else
                break;
        }
    }
    bubbleDown(index) {
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
            }
            else
                break;
        }
    }
    push(job) {
        this.heap.push(job);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    peek() {
        return this.heap[0];
    }
    remove(id) {
        const index = this.heap.findIndex((j) => j.id === id);
        if (index === -1)
            return;
        this.heap.splice(index, 1);
        for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
            this.bubbleDown(i);
        }
    }
    updatePriority(id, effectivePriority) {
        const job = this.heap.find((j) => j.id === id);
        if (!job)
            return;
        job.effectivePriority = effectivePriority;
        for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
            this.bubbleDown(i);
        }
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
};
exports.HeapService = HeapService;
exports.HeapService = HeapService = __decorate([
    (0, common_1.Injectable)()
], HeapService);
//# sourceMappingURL=heap.service.js.map
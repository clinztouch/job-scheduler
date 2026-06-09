"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TimingWheelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimingWheelService = void 0;
const common_1 = require("@nestjs/common");
const heap_service_1 = require("./heap.service");
const WHEEL_SIZE = 60;
let TimingWheelService = TimingWheelService_1 = class TimingWheelService {
    heap;
    logger = new common_1.Logger(TimingWheelService_1.name);
    wheel = new Map();
    currentSlot = 0;
    ticker = null;
    constructor(heap) {
        this.heap = heap;
        for (let i = 0; i < WHEEL_SIZE; i++) {
            this.wheel.set(i, []);
        }
    }
    onModuleInit() {
        this.ticker = setInterval(() => this.tick(), 1000);
        this.logger.log('Timing wheel started');
    }
    onModuleDestroy() {
        if (this.ticker)
            clearInterval(this.ticker);
    }
    schedule(entry) {
        const now = Date.now();
        const delay = Math.max(0, entry.scheduledAt.getTime() - now);
        const slotOffset = Math.floor(delay / 1000) % WHEEL_SIZE;
        const targetSlot = (this.currentSlot + slotOffset) % WHEEL_SIZE;
        this.wheel.get(targetSlot).push(entry);
        this.logger.log(`Job ${entry.jobId} scheduled in slot ${targetSlot} (delay ~${Math.floor(delay / 1000)}s)`);
    }
    tick() {
        const entries = this.wheel.get(this.currentSlot) ?? [];
        for (const entry of entries) {
            const now = new Date();
            if (entry.scheduledAt > now) {
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
        this.wheel.set(this.currentSlot, []);
        this.currentSlot = (this.currentSlot + 1) % WHEEL_SIZE;
    }
    benchmarkVsHeap(jobCount) {
        const jobs = Array.from({ length: jobCount }, (_, i) => ({
            jobId: `bench-${i}`,
            effectivePriority: Math.ceil(Math.random() * 3),
            scheduledAt: new Date(Date.now() + Math.random() * 60000),
            createdAt: new Date(),
        }));
        const tempHeap = new heap_service_1.HeapService();
        const heapStart = performance.now();
        for (const j of jobs) {
            tempHeap.push({ id: j.jobId, effectivePriority: j.effectivePriority, scheduledAt: j.scheduledAt, createdAt: j.createdAt });
        }
        const heapMs = performance.now() - heapStart;
        const wheelStart = performance.now();
        for (const j of jobs) {
            this.schedule(j);
        }
        const wheelMs = performance.now() - wheelStart;
        this.logger.log(`Benchmark (${jobCount} jobs) — Heap: ${heapMs.toFixed(3)}ms | Wheel: ${wheelMs.toFixed(3)}ms`);
        return { heapMs, wheelMs };
    }
};
exports.TimingWheelService = TimingWheelService;
exports.TimingWheelService = TimingWheelService = TimingWheelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [heap_service_1.HeapService])
], TimingWheelService);
//# sourceMappingURL=timing-wheel.service.js.map
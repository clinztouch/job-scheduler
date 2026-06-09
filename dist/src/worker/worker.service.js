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
var WorkerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const heap_service_1 = require("../scheduler/heap.service");
const timing_wheel_service_1 = require("../scheduler/timing-wheel.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const client_1 = require("@prisma/client");
const event_emitter_2 = require("@nestjs/event-emitter");
const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL_MS ?? '2000');
let WorkerService = WorkerService_1 = class WorkerService {
    prisma;
    heap;
    timingWheel;
    eventEmitter;
    logger = new common_1.Logger(WorkerService_1.name);
    poller = null;
    isProcessing = false;
    constructor(prisma, heap, timingWheel, eventEmitter) {
        this.prisma = prisma;
        this.heap = heap;
        this.timingWheel = timingWheel;
        this.eventEmitter = eventEmitter;
    }
    onModuleInit() {
        this.loadPendingJobsIntoHeap();
        this.poller = setInterval(() => this.poll(), POLL_INTERVAL_MS);
        this.logger.log(`Worker started | pollInterval=${POLL_INTERVAL_MS}ms`);
    }
    onModuleDestroy() {
        if (this.poller)
            clearInterval(this.poller);
    }
    async onReadmit(job) {
        await this.admitToHeap(job.id);
        this.logger.log(`Job readmitted | id=${job.id} status=PENDING`);
    }
    async onJobCreated(job) {
        await this.admitToHeap(job.id);
        this.logger.log(`Job admitted | id=${job.id} type=${job.type} priority=${job.priority}`);
    }
    async onJobCompleted(job) {
        const dependents = await this.prisma.jobDependency.findMany({
            where: { dependsOnId: job.id },
            include: {
                job: {
                    include: { dependencies: { include: { dependsOn: true } } },
                },
            },
        });
        for (const dep of dependents) {
            const allDone = dep.job.dependencies.every((d) => d.dependsOn.status === client_1.JobStatus.COMPLETED);
            if (allDone) {
                this.logger.log(`DAG unblocked | id=${dep.job.id} type=${dep.job.type}`);
                await this.admitToHeap(dep.job.id);
            }
        }
    }
    async loadPendingJobsIntoHeap() {
        const now = new Date();
        const dueJobs = await this.prisma.job.findMany({
            where: {
                status: client_1.JobStatus.PENDING,
                isDlq: false,
                OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
            },
        });
        for (const job of dueJobs) {
            const deps = await this.prisma.jobDependency.findMany({
                where: { jobId: job.id },
                include: { dependsOn: true },
            });
            const allDepsDone = deps.every((d) => d.dependsOn.status === client_1.JobStatus.COMPLETED);
            if (deps.length === 0 || allDepsDone) {
                this.heap.push({
                    id: job.id,
                    effectivePriority: job.effectivePriority,
                    scheduledAt: job.scheduledAt,
                    createdAt: job.createdAt,
                });
            }
        }
        const futureJobs = await this.prisma.job.findMany({
            where: {
                status: client_1.JobStatus.PENDING,
                isDlq: false,
                scheduledAt: { gt: now },
            },
        });
        for (const job of futureJobs) {
            this.timingWheel.schedule({
                jobId: job.id,
                effectivePriority: job.effectivePriority,
                scheduledAt: job.scheduledAt,
                createdAt: job.createdAt,
            });
        }
        this.logger.log(`Scheduler bootstrap | dueJobs=${dueJobs.length} futureJobs=${futureJobs.length}`);
    }
    async poll() {
        if (this.isProcessing || this.heap.isEmpty())
            return;
        this.isProcessing = true;
        try {
            const next = this.heap.peek();
            if (!next)
                return;
            const result = await this.prisma.job.updateMany({
                where: { id: next.id, status: client_1.JobStatus.PENDING },
                data: { status: client_1.JobStatus.PROCESSING },
            });
            if (result.count === 0) {
                this.heap.remove(next.id);
                return;
            }
            this.heap.remove(next.id);
            const lockedJob = await this.prisma.job.findUnique({ where: { id: next.id } });
            if (!lockedJob)
                return;
            this.logger.log(`Job started | id=${lockedJob.id} type=${lockedJob.type} priority=${lockedJob.priority}`);
            this.eventEmitter.emit('job.started', lockedJob);
            this.eventEmitter.emit('job.updated', { ...lockedJob, status: client_1.JobStatus.PROCESSING });
            this.eventEmitter.emit('job.execute', lockedJob);
        }
        finally {
            this.isProcessing = false;
        }
    }
    async admitToHeap(jobId) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.status !== client_1.JobStatus.PENDING)
            return;
        if (job.scheduledAt && job.scheduledAt > new Date()) {
            this.timingWheel.schedule({
                jobId: job.id,
                effectivePriority: job.effectivePriority,
                scheduledAt: job.scheduledAt,
                createdAt: job.createdAt,
            });
        }
        else {
            this.heap.push({
                id: job.id,
                effectivePriority: job.effectivePriority,
                scheduledAt: job.scheduledAt,
                createdAt: job.createdAt,
            });
        }
    }
};
exports.WorkerService = WorkerService;
__decorate([
    (0, event_emitter_2.OnEvent)('job.readmit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkerService.prototype, "onReadmit", null);
__decorate([
    (0, event_emitter_2.OnEvent)('job.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkerService.prototype, "onJobCreated", null);
__decorate([
    (0, event_emitter_2.OnEvent)('job.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkerService.prototype, "onJobCompleted", null);
exports.WorkerService = WorkerService = WorkerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        heap_service_1.HeapService,
        timing_wheel_service_1.TimingWheelService,
        event_emitter_1.EventEmitter2])
], WorkerService);
//# sourceMappingURL=worker.service.js.map
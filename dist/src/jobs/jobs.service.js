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
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const client_1 = require("@prisma/client");
let JobsService = JobsService_1 = class JobsService {
    prisma;
    eventEmitter;
    logger = new common_1.Logger(JobsService_1.name);
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(dto) {
        const { dependsOn, scheduledAt, ...rest } = dto;
        if (dependsOn?.length) {
            const found = await this.prisma.job.findMany({
                where: { id: { in: dependsOn } },
                select: { id: true },
            });
            if (found.length !== dependsOn.length) {
                throw new common_1.BadRequestException('One or more dependency job IDs do not exist');
            }
        }
        const job = await this.prisma.job.create({
            data: {
                ...rest,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                effectivePriority: rest.priority,
                dependencies: dependsOn?.length
                    ? { create: dependsOn.map((depId) => ({ dependsOnId: depId })) }
                    : undefined,
            },
            include: { dependencies: true },
        });
        this.logger.log(`Job created | id=${job.id} type=${job.type} priority=${job.priority}`);
        this.eventEmitter.emit('job.created', job);
        return job;
    }
    async findAll(query) {
        return this.prisma.job.findMany({
            where: {
                status: query.status,
                isDlq: false,
            },
            include: { dependencies: true, dependents: true },
            orderBy: [{ effectivePriority: 'asc' }, { scheduledAt: 'asc' }, { createdAt: 'asc' }],
        });
    }
    async findOne(id) {
        const job = await this.prisma.job.findUnique({
            where: { id },
            include: { dependencies: true, dependents: true },
        });
        if (!job)
            throw new common_1.NotFoundException(`Job ${id} not found`);
        return job;
    }
    async cancel(id) {
        const job = await this.prisma.job.findUnique({ where: { id } });
        if (!job)
            throw new common_1.NotFoundException(`Job ${id} not found`);
        if (job.status === client_1.JobStatus.COMPLETED || job.status === client_1.JobStatus.FAILED) {
            throw new common_1.BadRequestException(`Cannot cancel a job with status ${job.status}`);
        }
        const updated = await this.prisma.job.update({
            where: { id },
            data: { status: client_1.JobStatus.CANCELLED },
        });
        this.logger.log(`Job cancelled | id=${id}`);
        this.eventEmitter.emit('job.updated', updated);
        return updated;
    }
    async getDashboardCounts() {
        const [pending, processing, completed, failed, cancelled, dlq] = await Promise.all([
            this.prisma.job.count({ where: { status: client_1.JobStatus.PENDING, isDlq: false } }),
            this.prisma.job.count({ where: { status: client_1.JobStatus.PROCESSING } }),
            this.prisma.job.count({ where: { status: client_1.JobStatus.COMPLETED } }),
            this.prisma.job.count({ where: { status: client_1.JobStatus.FAILED, isDlq: false } }),
            this.prisma.job.count({ where: { status: client_1.JobStatus.CANCELLED } }),
            this.prisma.job.count({ where: { isDlq: true } }),
        ]);
        return { pending, processing, completed, failed, cancelled, dlq };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], JobsService);
//# sourceMappingURL=jobs.service.js.map
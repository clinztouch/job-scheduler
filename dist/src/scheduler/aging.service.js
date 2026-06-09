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
var AgingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgingService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const heap_service_1 = require("./heap.service");
const client_1 = require("@prisma/client");
const AGING_THRESHOLD_SECONDS = parseInt(process.env.AGING_INTERVAL_SECONDS ?? '30');
const AGING_BOOST = parseFloat(process.env.AGING_BOOST_AMOUNT ?? '0.5');
let AgingService = AgingService_1 = class AgingService {
    prisma;
    heap;
    logger = new common_1.Logger(AgingService_1.name);
    constructor(prisma, heap) {
        this.prisma = prisma;
        this.heap = heap;
    }
    async applyAging() {
        const threshold = new Date(Date.now() - AGING_THRESHOLD_SECONDS * 1000);
        const starvingJobs = await this.prisma.job.findMany({
            where: {
                status: client_1.JobStatus.PENDING,
                isDlq: false,
                createdAt: { lte: threshold },
                effectivePriority: { gt: 1 },
            },
        });
        if (starvingJobs.length === 0)
            return;
        for (const job of starvingJobs) {
            const newPriority = Math.max(1, job.effectivePriority - AGING_BOOST);
            await this.prisma.job.update({
                where: { id: job.id },
                data: { effectivePriority: newPriority },
            });
            this.heap.updatePriority(job.id, newPriority);
            this.logger.log(`Aging applied | jobId=${job.id} oldPriority=${job.effectivePriority} newPriority=${newPriority}`);
        }
        this.logger.log(`Aging run complete | ${starvingJobs.length} jobs boosted`);
    }
};
exports.AgingService = AgingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgingService.prototype, "applyAging", null);
exports.AgingService = AgingService = AgingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        heap_service_1.HeapService])
], AgingService);
//# sourceMappingURL=aging.service.js.map
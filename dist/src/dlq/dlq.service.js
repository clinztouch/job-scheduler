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
var DlqService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DlqService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_2 = require("@nestjs/event-emitter");
const client_1 = require("@prisma/client");
const DLQ_THRESHOLD = parseInt(process.env.DLQ_ALERT_THRESHOLD ?? '10');
let DlqService = DlqService_1 = class DlqService {
    prisma;
    eventEmitter;
    logger = new common_1.Logger(DlqService_1.name);
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async onJobMovedToDlq(job) {
        this.logger.error(`Job entered DLQ | id=${job.id} type=${job.type} error=${job.errorMessage}`);
        await this.checkThreshold();
    }
    async checkThreshold() {
        const count = await this.prisma.job.count({ where: { isDlq: true } });
        if (count >= DLQ_THRESHOLD) {
            this.logger.error(`DLQ ALERT: threshold reached | count=${count} threshold=${DLQ_THRESHOLD}`);
            this.simulateAlertEmail(count);
        }
    }
    simulateAlertEmail(count) {
        this.logger.warn(`[MOCK ALERT EMAIL] To: ops@dilamme.com | Subject: DLQ threshold breached | DLQ job count is ${count}, threshold is ${DLQ_THRESHOLD}. Immediate investigation required.`);
    }
    async findAll() {
        return this.prisma.job.findMany({
            where: { isDlq: true },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async manualRetry(id) {
        const job = await this.prisma.job.findUnique({ where: { id } });
        if (!job)
            throw new common_1.NotFoundException(`Job ${id} not found`);
        if (!job.isDlq)
            throw new common_1.NotFoundException(`Job ${id} is not in the DLQ`);
        const updated = await this.prisma.job.update({
            where: { id },
            data: {
                status: client_1.JobStatus.PENDING,
                retryCount: 0,
                isDlq: false,
                errorMessage: null,
                scheduledAt: null,
            },
        });
        this.logger.log(`Manual DLQ retry | id=${id}`);
        this.eventEmitter.emit('job.updated', updated);
        this.eventEmitter.emit('job.readmit', updated);
        return updated;
    }
};
exports.DlqService = DlqService;
__decorate([
    (0, event_emitter_1.OnEvent)('job.dlq'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DlqService.prototype, "onJobMovedToDlq", null);
exports.DlqService = DlqService = DlqService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_2.EventEmitter2])
], DlqService);
//# sourceMappingURL=dlq.service.js.map
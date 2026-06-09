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
var RetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_2 = require("@nestjs/event-emitter");
const client_1 = require("@prisma/client");
const MAX_RETRIES = 3;
function getBackoffMs(attempt) {
    const base = Math.pow(5, attempt - 1) * 1000;
    const jitter = Math.random() * 500;
    return base + jitter;
}
let RetryService = RetryService_1 = class RetryService {
    prisma;
    eventEmitter;
    logger = new common_1.Logger(RetryService_1.name);
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async handleFailure(payload) {
        const { job, error } = payload;
        const fresh = await this.prisma.job.findUnique({ where: { id: job.id } });
        if (!fresh)
            return;
        if (fresh.status === client_1.JobStatus.CANCELLED) {
            this.logger.log(`Job ${job.id} was cancelled — skipping retry`);
            return;
        }
        const newRetryCount = fresh.retryCount + 1;
        if (newRetryCount <= MAX_RETRIES) {
            const backoffMs = getBackoffMs(newRetryCount);
            const updated = await this.prisma.job.update({
                where: { id: job.id },
                data: {
                    status: client_1.JobStatus.PENDING,
                    retryCount: newRetryCount,
                    errorMessage: error,
                    scheduledAt: new Date(Date.now() + backoffMs),
                },
            });
            this.logger.warn(`Retry scheduled | id=${job.id} attempt=${newRetryCount} backoff=${Math.round(backoffMs)}ms`);
            this.eventEmitter.emit('job.updated', updated);
            this.eventEmitter.emit('job.retry', { job: updated, attempt: newRetryCount });
            setTimeout(() => {
                this.eventEmitter.emit('job.readmit', updated);
            }, backoffMs);
        }
        else {
            const updated = await this.prisma.job.update({
                where: { id: job.id },
                data: {
                    status: client_1.JobStatus.FAILED,
                    retryCount: newRetryCount,
                    errorMessage: error,
                    isDlq: true,
                },
            });
            this.logger.error(`Job moved to DLQ | id=${job.id} error=${error}`);
            this.eventEmitter.emit('job.updated', updated);
            this.eventEmitter.emit('job.dlq', updated);
        }
    }
};
exports.RetryService = RetryService;
__decorate([
    (0, event_emitter_1.OnEvent)('job.failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RetryService.prototype, "handleFailure", null);
exports.RetryService = RetryService = RetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_2.EventEmitter2])
], RetryService);
//# sourceMappingURL=retry.service.js.map
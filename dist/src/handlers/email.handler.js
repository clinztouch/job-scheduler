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
var EmailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailHandler = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_2 = require("@nestjs/event-emitter");
const client_1 = require("@prisma/client");
const FAILURE_RATE = 0.3;
let EmailHandler = EmailHandler_1 = class EmailHandler {
    prisma;
    eventEmitter;
    logger = new common_1.Logger(EmailHandler_1.name);
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async handle(job) {
        if (job.type !== 'send_email')
            return;
        this.logger.log(`Executing email job | id=${job.id} payload=${JSON.stringify(job.payload)}`);
        try {
            await this.simulateEmailSend(job.payload);
            const current = await this.prisma.job.findUnique({
                where: { id: job.id },
                select: { status: true },
            });
            if (current?.status === client_1.JobStatus.CANCELLED) {
                this.logger.warn(`Job cancelled during processing | id=${job.id} — skipping COMPLETED`);
                return;
            }
            const updated = await this.prisma.job.update({
                where: { id: job.id },
                data: { status: client_1.JobStatus.COMPLETED },
            });
            this.logger.log(`Job completed | id=${job.id}`);
            this.eventEmitter.emit('job.completed', updated);
            this.eventEmitter.emit('job.updated', updated);
            if (job.interval) {
                const intervalMs = this.getIntervalMs(job.interval);
                const nextRun = new Date(Date.now() + intervalMs);
                const nextJob = await this.prisma.job.create({
                    data: {
                        type: job.type,
                        payload: job.payload ?? {},
                        priority: job.priority,
                        interval: job.interval,
                        scheduledAt: nextRun,
                        effectivePriority: job.priority,
                    },
                });
                this.logger.log(`Recurring job scheduled | id=${nextJob.id} nextRun=${nextRun.toISOString()}`);
                this.eventEmitter.emit('job.readmit', nextJob);
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            this.logger.warn(`Job failed | id=${job.id} error=${message}`);
            this.eventEmitter.emit('job.failed', { job, error: message });
        }
    }
    async simulateEmailSend(payload) {
        const latency = 200 + Math.random() * 800;
        await new Promise((r) => setTimeout(r, latency));
        if (!payload?.to || !payload?.subject) {
            throw new Error('Invalid email payload: missing "to" or "subject"');
        }
        if (Math.random() < FAILURE_RATE) {
            throw new Error(`SMTP connection timeout sending to ${payload.to}`);
        }
        this.logger.log(`[MOCK EMAIL SENT] to=${payload.to} subject="${payload.subject}" body="${payload.body ?? '(no body)'}"`);
    }
    getIntervalMs(interval) {
        switch (interval) {
            case 'every_1_minute': return 60 * 1000;
            case 'every_5_minutes': return 5 * 60 * 1000;
            case 'every_1_hour': return 60 * 60 * 1000;
            default: return 60 * 1000;
        }
    }
};
exports.EmailHandler = EmailHandler;
__decorate([
    (0, event_emitter_1.OnEvent)('job.execute'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailHandler.prototype, "handle", null);
exports.EmailHandler = EmailHandler = EmailHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_2.EventEmitter2])
], EmailHandler);
//# sourceMappingURL=email.handler.js.map
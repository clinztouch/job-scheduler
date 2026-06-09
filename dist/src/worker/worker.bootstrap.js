"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("../prisma/prisma.module");
const logger_module_1 = require("../logger/logger.module");
const scheduler_module_1 = require("../scheduler/scheduler.module");
const worker_module_1 = require("./worker.module");
const handlers_module_1 = require("../handlers/handlers.module");
const retry_module_1 = require("../retry/retry.module");
const dlq_module_1 = require("../dlq/dlq.module");
const nestjs_pino_1 = require("nestjs-pino");
let WorkerAppModule = class WorkerAppModule {
};
WorkerAppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            logger_module_1.AppLoggerModule,
            scheduler_module_1.SchedulerModule,
            worker_module_1.WorkerModule,
            handlers_module_1.HandlersModule,
            retry_module_1.RetryModule,
            dlq_module_1.DlqModule,
        ],
    })
], WorkerAppModule);
async function bootstrapWorker() {
    const app = await core_1.NestFactory.create(WorkerAppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    await app.init();
    console.log('Worker process started — no HTTP server');
}
bootstrapWorker();
//# sourceMappingURL=worker.bootstrap.js.map
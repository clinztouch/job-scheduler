"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
async function bootstrap() {
    if (process.env.WORKER_ONLY === 'true') {
        console.log('Use worker.bootstrap.ts directly for worker-only mode');
        process.exit(0);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Job Scheduler API')
        .setDescription('Background job scheduler with priority queue, DAG workflows, and DLQ')
        .setVersion('1.0')
        .addTag('Jobs')
        .addTag('Dead Letter Queue')
        .addTag('Scheduler Events')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'frontend'));
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}`);
    console.log(`Swagger docs: http://localhost:${process.env.PORT ?? 3000}/api-docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map
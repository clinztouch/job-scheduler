import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

const isWorkerOnly = process.env.WORKER_ONLY === 'true';

async function bootstrap() {
  if (isWorkerOnly) {
    // Worker-only mode — no HTTP server, no Swagger, no static assets
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    app.useLogger(app.get(Logger));
    await app.init();
    console.log('Worker process started — polling for jobs');
    return;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

  const config = new DocumentBuilder()
    .setTitle('Job Scheduler API')
    .setDescription('Background job scheduler with priority queue, DAG workflows, and DLQ')
    .setVersion('1.0')
    .addTag('Jobs')
    .addTag('Dead Letter Queue')
    .addTag('Scheduler Events')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.useStaticAssets(join(process.cwd(), 'frontend'));
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs: http://localhost:${process.env.PORT ?? 3000}/api-docs`);
}
bootstrap();
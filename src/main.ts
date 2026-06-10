import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  if (process.env.WORKER_ONLY === 'true') {
    // Worker-only mode — worker.bootstrap.ts is the entry point
    // Run with: pnpm start:worker:dev
    console.log('Use worker.bootstrap.ts directly for worker-only mode');
    process.exit(0);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

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
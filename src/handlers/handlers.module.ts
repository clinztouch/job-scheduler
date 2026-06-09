import { Module } from '@nestjs/common';
import { EmailHandler } from './email.handler';

@Module({
  providers: [EmailHandler],
})
export class HandlersModule {}
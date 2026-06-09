import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subject } from 'rxjs';

@ApiTags('Scheduler Events')
@Controller('sse')
export class SseController {
  private subject = new Subject<MessageEvent>();

  @OnEvent('job.updated')
  onJobUpdated(job: unknown) {
    this.subject.next({ data: job as object });
  }

  @Sse('jobs')
  @ApiOperation({ summary: 'SSE stream — real-time job status updates' })
  stream(): Observable<MessageEvent> {
    return this.subject.asObservable();
  }
}
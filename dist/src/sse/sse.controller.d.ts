import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class SseController {
    private subject;
    onJobUpdated(job: unknown): void;
    stream(): Observable<MessageEvent>;
}

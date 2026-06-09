import { TimingWheelService } from './timing-wheel.service';
export declare class SchedulerController {
    private readonly timingWheel;
    constructor(timingWheel: TimingWheelService);
    benchmark(count?: string): {
        jobCount: number;
        heapMs: number;
        wheelMs: number;
        winner: string;
        analysis: {
            heap: string;
            timingWheel: string;
        };
    };
}

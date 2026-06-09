import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TimingWheelService } from './timing-wheel.service';

@ApiTags('Scheduler Events')
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly timingWheel: TimingWheelService) {}

  @Get('benchmark')
  @ApiOperation({
    summary: 'Benchmark heap vs timing wheel',
    description:
      'Inserts N jobs into both algorithms and returns insertion time in ms. Heap wins on dynamic priority changes, timing wheel wins on fixed-interval scheduling.',
  })
  @ApiQuery({ name: 'count', required: false, example: 1000 })
  benchmark(@Query('count') count = '1000') {
    const jobCount = Math.min(parseInt(count), 10000);
    const results = this.timingWheel.benchmarkVsHeap(jobCount);
    return {
      jobCount,
      heapMs: results.heapMs,
      wheelMs: results.wheelMs,
      winner: results.heapMs < results.wheelMs ? 'heap' : 'timing-wheel',
      analysis: {
        heap: 'O(log n) insertion, dynamic priority reordering, best for mixed workloads',
        timingWheel:
          'O(1) insertion into bucket, best for fixed-interval recurring jobs, less flexible on priority',
      },
    };
  }
}
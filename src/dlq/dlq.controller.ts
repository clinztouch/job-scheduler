import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DlqService } from './dlq.service';

@ApiTags('Dead Letter Queue')
@Controller('dlq')
export class DlqController {
  constructor(private readonly dlqService: DlqService) {}

  @Get()
  @ApiOperation({ summary: 'List all jobs in the DLQ' })
  findAll() {
    return this.dlqService.findAll();
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Manually retry a DLQ job' })
  @ApiResponse({ status: 404, description: 'Job not found or not in DLQ' })
  retry(@Param('id') id: string) {
    return this.dlqService.manualRetry(id);
  }
}
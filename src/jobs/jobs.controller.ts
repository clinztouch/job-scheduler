import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobDto } from './dto/query-jobs.dto'; 

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload or dependency IDs' })
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all jobs, optionally filtered by status' })
  findAll(@Query() query: QueryJobDto) {
    return this.jobsService.findAll(query);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get job counts by status for dashboard' })
  getDashboard() {
    return this.jobsService.getDashboardCounts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single job by ID' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a job' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed or failed job' })
  cancel(@Param('id') id: string) {
    return this.jobsService.cancel(id);
  }
}
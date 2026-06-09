import {
  IsString,
  IsInt,
  IsIn,
  IsObject,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ example: 'send_email', description: 'Job type identifier' })
  @IsString()
  type: string;

  @ApiProperty({ example: { to: 'test@gmail.com', subject: 'Welcome' } })
  @IsObject()
  payload: Record<string, any>;

  @ApiProperty({ example: 1, description: '1=High, 2=Medium, 3=Low' })
  @IsInt()
  @Min(1)
  @Max(3)
  priority: number;

  @ApiPropertyOptional({ example: '2026-06-10T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    example: 'every_5_minutes',
    enum: ['every_1_minute', 'every_5_minutes', 'every_1_hour'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['every_1_minute', 'every_5_minutes', 'every_1_hour'])
  interval?: string;

  @ApiPropertyOptional({
    example: ['uuid-of-job-1', 'uuid-of-job-2'],
    description: 'Job IDs this job depends on (DAG)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  dependsOn?: string[];
}
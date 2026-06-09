import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryJobDto {
  @ApiPropertyOptional({
    enum: [
        'PENDING', 
        'PROCESSING', 
        'COMPLETED', 
        'FAILED', 
        'CANCELLED'
    ],
  })
  @IsOptional()
  @IsIn([
    'PENDING', 
    'PROCESSING',
     'COMPLETED', 
     'FAILED', 
     'CANCELLED'
    ])
  status?: string;
}
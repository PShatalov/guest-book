import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ListMessagesQueryDto {
  @ApiPropertyOptional({
    type: 'integer',
    description: 'Maximum number of messages per page',
    default: 20,
    minimum: 1,
    maximum: 50,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Opaque cursor from a previous page nextCursor value',
    example:
      'eyJjcmVhdGVkQXQiOiIyMDI2LTA1LTE1VDEyOjAwOjAwLjAwMFoiLCJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCJ9',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description:
      'Filter by category tag (trimmed and lowercased before match). Empty or whitespace-only values return 400.',
    example: 'general',
    minLength: 1,
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'categoryTag must not be empty' })
  @MaxLength(32)
  categoryTag?: string;

  @ApiPropertyOptional({
    description:
      'Inclusive lower bound on message createdAt (ISO-8601 date-time, UTC)',
    format: 'date-time',
    example: '2026-05-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  createdFrom?: string;

  @ApiPropertyOptional({
    description:
      'Inclusive upper bound on message createdAt (ISO-8601 date-time, UTC)',
    format: 'date-time',
    example: '2026-05-15T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  createdTo?: string;

  @ApiPropertyOptional({
    description:
      'Filter by author username (trimmed; case-insensitive exact match). Empty or whitespace-only values return 400.',
    example: 'alice',
    minLength: 1,
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'authorUsername must not be empty' })
  @MaxLength(64)
  authorUsername?: string;
}

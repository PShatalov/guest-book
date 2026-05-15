import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ListMessagesQueryDto {
  @ApiPropertyOptional({
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
}

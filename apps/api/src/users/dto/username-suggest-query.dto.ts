import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UsernameSuggestQueryDto {
  @ApiProperty({
    description:
      'Username prefix for typeahead (trimmed before match). Empty or whitespace-only values return 400.',
    example: 'ali',
    minLength: 1,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty({ message: 'q must not be empty' })
  @MinLength(1, { message: 'q must not be empty' })
  @MaxLength(64)
  q!: string;

  @ApiProperty({
    type: 'integer',
    description: 'Maximum number of username suggestions',
    default: 10,
    minimum: 1,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

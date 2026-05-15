import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageRequestDto {
  @ApiProperty({ example: 'Hello guestbook', minLength: 1, maxLength: 240 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  text!: string;

  @ApiProperty({ example: 'general', minLength: 1, maxLength: 32 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(32)
  categoryTag!: string;
}

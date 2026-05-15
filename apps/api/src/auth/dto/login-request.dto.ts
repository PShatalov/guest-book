import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'guest_user', minLength: 1, maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(64)
  username!: string;

  @ApiProperty({ example: 'Str0ng!pass', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password!: string;
}

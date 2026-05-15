import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'guest_user', maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  username!: string;

  @ApiProperty({ example: 'Str0ng!pass' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { IsPasswordPolicy } from '../../common/validators/is-password-policy.decorator';

export class RegisterRequestDto {
  @ApiProperty({ example: 'guest_user', maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(64)
  username!: string;

  @ApiProperty({
    example: 'Str0ng!pass',
    description:
      'Min 8 chars with uppercase, lowercase, digit, and special character',
  })
  @IsString()
  @IsNotEmpty()
  @IsPasswordPolicy()
  password!: string;
}

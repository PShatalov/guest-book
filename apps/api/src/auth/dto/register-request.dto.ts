import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { IsPasswordPolicy } from '../../common/validators/is-password-policy.decorator';

export class RegisterRequestDto {
  @ApiProperty({ minLength: 1, maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(64)
  username!: string;

  @ApiProperty({
    example: 'Str0ng!pass',
    minLength: 8,
    pattern:
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>\\[\\]\\\\/`\'~_+=-]).{8,}$',
    description:
      'Min 8 chars with uppercase, lowercase, digit, and special character',
  })
  @IsString()
  @IsNotEmpty()
  @IsPasswordPolicy()
  password!: string;
}

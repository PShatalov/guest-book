import { ApiProperty } from '@nestjs/swagger';

export class UsernameSuggestResponseDto {
  @ApiProperty({
    type: [String],
    description: 'Usernames matching the query prefix, sorted ascending',
    example: ['alice', 'alicia'],
  })
  items!: string[];
}

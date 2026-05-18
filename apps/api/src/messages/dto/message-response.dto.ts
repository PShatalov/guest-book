import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Hello guestbook' })
  text!: string;

  @ApiProperty({ example: 'general' })
  categoryTag!: string;

  @ApiProperty({ example: 'guest_user' })
  authorUsername!: string;

  @ApiProperty({ example: '2026-05-15T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: false })
  isBookmarked!: boolean;
}

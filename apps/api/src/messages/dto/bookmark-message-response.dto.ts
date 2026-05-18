import { ApiProperty } from '@nestjs/swagger';

export class BookmarkMessageResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  messageId!: string;

  @ApiProperty({ example: true })
  isBookmarked!: boolean;

  @ApiProperty({ example: '2026-05-15T12:00:00.000Z' })
  createdAt!: string;
}

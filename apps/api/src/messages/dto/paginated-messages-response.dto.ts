import { ApiProperty } from '@nestjs/swagger';
import { MessageResponseDto } from './message-response.dto';

export class PaginatedMessagesResponseDto {
  @ApiProperty({ type: [MessageResponseDto] })
  items!: MessageResponseDto[];

  @ApiProperty({ example: true })
  hasMore!: boolean;

  @ApiProperty({
    nullable: true,
    type: String,
    example:
      'eyJjcmVhdGVkQXQiOiIyMDI2LTA1LTE1VDEyOjAwOjAwLjAwMFoiLCJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCJ9',
  })
  nextCursor!: string | null;
}

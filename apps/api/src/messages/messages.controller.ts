import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthenticatedSessionGuard } from '../common/guards/authenticated-session.guard';
import { CreateMessageRequestDto } from './dto/create-message-request.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessagesApplicationService } from './messages-application.service';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesApplicationService: MessagesApplicationService,
  ) {}

  @Post()
  @UseGuards(AuthenticatedSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a short message with a category tag' })
  @ApiCreatedResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async create(
    @Body() body: CreateMessageRequestDto,
    @Req() request: Request,
  ): Promise<MessageResponseDto> {
    return this.messagesApplicationService.createMessage(request, body);
  }
}

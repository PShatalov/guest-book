import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthenticatedSessionGuard } from '../common/guards/authenticated-session.guard';
import { CreateMessageRequestDto } from './dto/create-message-request.dto';
import { ListMessagesQueryDto } from './dto/list-messages-query.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { PaginatedMessagesResponseDto } from './dto/paginated-messages-response.dto';
import { UpdateMessageRequestDto } from './dto/update-message-request.dto';
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

  @Get()
  @ApiOperation({
    summary:
      'List messages with cursor pagination, optional tag and author username filters, and optional createdFrom/createdTo date-time bounds',
  })
  @ApiOkResponse({ type: PaginatedMessagesResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async list(
    @Query() query: ListMessagesQueryDto,
  ): Promise<PaginatedMessagesResponseDto> {
    return this.messagesApplicationService.listMessages(query);
  }

  @Patch(':id')
  @UseGuards(AuthenticatedSessionGuard)
  @ApiOperation({ summary: 'Update own message text and category tag' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({
    description: 'Validation failed or invalid message id',
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not the message author' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMessageRequestDto,
    @Req() request: Request,
  ): Promise<MessageResponseDto> {
    return this.messagesApplicationService.updateMessage(request, id, body);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedSessionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete own message' })
  @ApiNoContentResponse({ description: 'Message deleted' })
  @ApiBadRequestResponse({ description: 'Invalid message id' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not the message author' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.messagesApplicationService.deleteMessage(request, id);
  }
}

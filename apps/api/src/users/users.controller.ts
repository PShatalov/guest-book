import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsernameSuggestQueryDto } from './dto/username-suggest-query.dto';
import { UsernameSuggestResponseDto } from './dto/username-suggest-response.dto';
import { UsernameSuggestionService } from './username-suggestion.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usernameSuggestionService: UsernameSuggestionService,
  ) {}

  @Get('username-suggest')
  @ApiOperation({
    summary:
      'Suggest usernames matching a prefix for typeahead (public, case-insensitive)',
  })
  @ApiOkResponse({ type: UsernameSuggestResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  suggest(
    @Query() query: UsernameSuggestQueryDto,
  ): Promise<UsernameSuggestResponseDto> {
    return this.usernameSuggestionService.suggest(query);
  }
}

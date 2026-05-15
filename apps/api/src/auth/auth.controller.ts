import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthenticatedSessionGuard } from '../common/guards/authenticated-session.guard';
import { AuthApplicationService } from './auth-application.service';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authApplicationService: AuthApplicationService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and start a session' })
  @ApiCreatedResponse({ type: AuthUserResponseDto })
  @ApiConflictResponse({ description: 'Username already exists' })
  async register(
    @Body() body: RegisterRequestDto,
    @Req() request: Request,
  ): Promise<AuthUserResponseDto> {
    const user = await this.authApplicationService.register(request, body);
    return { username: user.username };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with username and password' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() body: LoginRequestDto,
    @Req() request: Request,
  ): Promise<AuthUserResponseDto> {
    const user = await this.authApplicationService.login(request, body);
    return { username: user.username };
  }

  @Get('session')
  @UseGuards(AuthenticatedSessionGuard)
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getSession(@Req() request: Request): AuthUserResponseDto {
    const user = this.authApplicationService.getSession(request);
    return { username: user.username };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'End the current session' })
  async logout(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    await this.authApplicationService.logout(request);
    response.status(HttpStatus.NO_CONTENT).send();
  }
}

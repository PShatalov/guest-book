import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthSessionService } from './auth-session.service';
import type { SafeUserDto } from './user-registration.service';
import { UserAuthenticationService } from './user-authentication.service';
import { UserRegistrationService } from './user-registration.service';

@Injectable()
export class AuthApplicationService {
  constructor(
    private readonly userRegistrationService: UserRegistrationService,
    private readonly userAuthenticationService: UserAuthenticationService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async register(
    request: Request,
    input: { username: string; password: string },
  ): Promise<SafeUserDto> {
    const user = await this.userRegistrationService.register(input);
    await this.authSessionService.establishSessionAsync(request, user);
    return user;
  }

  async login(
    request: Request,
    input: { username: string; password: string },
  ): Promise<SafeUserDto> {
    const user = await this.userAuthenticationService.authenticate(input);
    await this.authSessionService.establishSessionAsync(request, user);
    return user;
  }

  getSession(request: Request): SafeUserDto {
    return this.authSessionService.getCurrentUser(request);
  }

  async logout(request: Request): Promise<void> {
    if (!request.session) {
      return;
    }
    await this.authSessionService.destroySession(request);
  }
}

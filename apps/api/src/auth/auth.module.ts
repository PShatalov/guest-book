import { Module } from '@nestjs/common';
import { AuthenticatedSessionGuard } from '../common/guards/authenticated-session.guard';
import { AuthApplicationService } from './auth-application.service';
import { AuthController } from './auth.controller';
import { AuthSessionService } from './auth-session.service';
import { UserAccountsRepository } from './user-accounts.repository';
import { UserAuthenticationService } from './user-authentication.service';
import { UserRegistrationService } from './user-registration.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthApplicationService,
    UserAccountsRepository,
    UserRegistrationService,
    UserAuthenticationService,
    AuthSessionService,
    AuthenticatedSessionGuard,
  ],
  exports: [
    AuthenticatedSessionGuard,
    AuthSessionService,
    UserAccountsRepository,
  ],
})
export class AuthModule {}

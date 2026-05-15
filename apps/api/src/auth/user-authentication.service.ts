import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { SafeUserDto } from './user-registration.service';
import { UserAccountsRepository } from './user-accounts.repository';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';

@Injectable()
export class UserAuthenticationService {
  private dummyPasswordHashPromise: Promise<string> | null = null;

  constructor(
    private readonly userAccountsRepository: UserAccountsRepository,
  ) {}

  private getDummyPasswordHash(): Promise<string> {
    if (!this.dummyPasswordHashPromise) {
      this.dummyPasswordHashPromise = argon2.hash(
        'timing-mitigation-placeholder-password',
      );
    }
    return this.dummyPasswordHashPromise;
  }

  async authenticate(input: {
    username: string;
    password: string;
  }): Promise<SafeUserDto> {
    const user = await this.userAccountsRepository.findByUsername(
      input.username,
    );
    const hashToVerify =
      user?.passwordHash ?? (await this.getDummyPasswordHash());
    const passwordMatches = await argon2.verify(hashToVerify, input.password);

    if (!user || !passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return { id: user.id, username: user.username };
  }
}

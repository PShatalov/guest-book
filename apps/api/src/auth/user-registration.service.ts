import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { validatePasswordPolicy } from '../common/validators/password-policy.validator';
import { UsernameAlreadyExistsError } from './errors/username-already-exists.error';
import { UserAccountsRepository } from './user-accounts.repository';

export type SafeUserDto = {
  id: string;
  username: string;
};

@Injectable()
export class UserRegistrationService {
  constructor(
    private readonly userAccountsRepository: UserAccountsRepository,
  ) {}

  async register(input: {
    username: string;
    password: string;
  }): Promise<SafeUserDto> {
    const policyResult = validatePasswordPolicy(input.password);
    if (!policyResult.valid) {
      throw new BadRequestException({
        statusCode: 400,
        message: policyResult.violations,
        error: 'Bad Request',
      });
    }

    const passwordHash = await argon2.hash(input.password);

    try {
      const user = await this.userAccountsRepository.create({
        username: input.username,
        passwordHash,
      });

      return { id: user.id, username: user.username };
    } catch (error) {
      if (error instanceof UsernameAlreadyExistsError) {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }
}

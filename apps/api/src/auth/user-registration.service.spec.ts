import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsernameAlreadyExistsError } from './errors/username-already-exists.error';
import { UserAccountsRepository } from './user-accounts.repository';
import { UserRegistrationService } from './user-registration.service';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UserRegistrationService', () => {
  let service: UserRegistrationService;
  let repository: {
    create: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockResolvedValue({
        id: 'user-id',
        username: 'alice',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRegistrationService,
        { provide: UserAccountsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(UserRegistrationService);
  });

  it('registers a user with a hashed password', async () => {
    await expect(
      service.register({ username: 'alice', password: 'Str0ng!pass' }),
    ).resolves.toEqual({ id: 'user-id', username: 'alice' });

    expect(repository.create).toHaveBeenCalledWith({
      username: 'alice',
      passwordHash: 'hashed-password',
    });
  });

  it('maps duplicate usernames to conflict', async () => {
    repository.create.mockRejectedValue(new UsernameAlreadyExistsError());

    await expect(
      service.register({ username: 'alice', password: 'Str0ng!pass' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

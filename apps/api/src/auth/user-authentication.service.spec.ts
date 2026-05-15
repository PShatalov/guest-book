import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { UserAccountsRepository } from './user-accounts.repository';
import { UserAuthenticationService } from './user-authentication.service';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('dummy-hash'),
  verify: jest.fn(),
}));

const mockedArgon2 = jest.mocked(argon2);

describe('UserAuthenticationService', () => {
  let service: UserAuthenticationService;
  let repository: {
    findByUsername: jest.Mock;
  };

  beforeEach(async () => {
    mockedArgon2.verify.mockReset();
    repository = {
      findByUsername: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthenticationService,
        { provide: UserAccountsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(UserAuthenticationService);
  });

  it('returns the user when credentials are valid', async () => {
    repository.findByUsername.mockResolvedValue({
      id: 'user-id',
      username: 'alice',
      passwordHash: 'stored-hash',
      createdAt: new Date(),
    });
    mockedArgon2.verify.mockResolvedValue(true);

    await expect(
      service.authenticate({ username: 'alice', password: 'Str0ng!pass' }),
    ).resolves.toEqual({ id: 'user-id', username: 'alice' });
  });

  it('throws unauthorized when the password is wrong', async () => {
    repository.findByUsername.mockResolvedValue({
      id: 'user-id',
      username: 'alice',
      passwordHash: 'stored-hash',
      createdAt: new Date(),
    });
    mockedArgon2.verify.mockResolvedValue(false);

    await expect(
      service.authenticate({ username: 'alice', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws unauthorized when the username does not exist', async () => {
    repository.findByUsername.mockResolvedValue(null);
    mockedArgon2.verify.mockResolvedValue(false);

    await expect(
      service.authenticate({ username: 'missing', password: 'Str0ng!pass' }),
    ).rejects.toThrow('Invalid credentials');
  });
});

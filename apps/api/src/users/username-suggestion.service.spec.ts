import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserAccountsRepository } from '../auth/user-accounts.repository';
import { UsernameSuggestionService } from './username-suggestion.service';

describe('UsernameSuggestionService', () => {
  let service: UsernameSuggestionService;
  let repository: { findUsernamesContaining: jest.Mock };

  beforeEach(async () => {
    repository = {
      findUsernamesContaining: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsernameSuggestionService,
        { provide: UserAccountsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(UsernameSuggestionService);
  });

  it('returns suggestions for a trimmed prefix with default limit', async () => {
    repository.findUsernamesContaining.mockResolvedValue(['alice', 'alicia']);

    await expect(service.suggest({ q: ' Ali ' })).resolves.toEqual({
      items: ['alice', 'alicia'],
    });

    expect(repository.findUsernamesContaining).toHaveBeenCalledWith('Ali', 10);
  });

  it('passes a custom limit to the repository', async () => {
    await service.suggest({ q: 'bob', limit: 5 });

    expect(repository.findUsernamesContaining).toHaveBeenCalledWith('bob', 5);
  });

  it('rejects a whitespace-only query', async () => {
    await expect(service.suggest({ q: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(repository.findUsernamesContaining).not.toHaveBeenCalled();
  });

  it('rejects a query longer than 64 characters', async () => {
    await expect(service.suggest({ q: 'a'.repeat(65) })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(repository.findUsernamesContaining).not.toHaveBeenCalled();
  });

  it('rejects an out-of-range limit', async () => {
    await expect(
      service.suggest({ q: 'ali', limit: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.findUsernamesContaining).not.toHaveBeenCalled();
  });
});

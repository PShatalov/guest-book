import { escapeSqlLikePattern } from './escape-sql-like-pattern';

describe('escapeSqlLikePattern', () => {
  it('escapes SQL LIKE wildcard characters', () => {
    expect(escapeSqlLikePattern('a%b_c\\d')).toBe('a\\%b\\_c\\\\d');
  });
});

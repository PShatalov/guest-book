import { passwordPolicyValidator } from './passwordPolicyValidator';

describe('passwordPolicyValidator', () => {
  it('accepts a password that meets all rules', () => {
    const result = passwordPolicyValidator('Str0ng!pass');
    expect(result).toEqual({ isValid: true });
  });

  it('returns violations for a weak password', () => {
    const result = passwordPolicyValidator('weak');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.violations.length).toBeGreaterThan(0);
    }
  });
});

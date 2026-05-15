import { validatePasswordPolicy } from './password-policy.validator';

describe('validatePasswordPolicy', () => {
  it('accepts a password that meets all rules', () => {
    expect(validatePasswordPolicy('Str0ng!pass')).toEqual({ valid: true });
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = validatePasswordPolicy('Sh0!rt');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.violations).toContain(
        'Password must be at least 8 characters long',
      );
    }
  });

  it('rejects passwords without uppercase letters', () => {
    const result = validatePasswordPolicy('str0ng!pass');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.violations).toContain(
        'Password must contain at least one uppercase letter',
      );
    }
  });

  it('rejects passwords without lowercase letters', () => {
    const result = validatePasswordPolicy('STR0NG!PASS');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.violations).toContain(
        'Password must contain at least one lowercase letter',
      );
    }
  });

  it('rejects passwords without digits', () => {
    const result = validatePasswordPolicy('Strong!pass');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.violations).toContain(
        'Password must contain at least one number',
      );
    }
  });

  it('rejects passwords without special characters', () => {
    const result = validatePasswordPolicy('Strong0pass');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.violations).toContain(
        'Password must contain at least one special character (e.g. @, #, $, %, ^, &, *)',
      );
    }
  });
});

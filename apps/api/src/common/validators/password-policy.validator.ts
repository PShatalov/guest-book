const MIN_LENGTH = 8;
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const DIGIT_PATTERN = /[0-9]/;
const SPECIAL_PATTERN = /[!@#$%^&*(),.?":{}|<>[\]\\/`'~_+=-]/;

export type PasswordPolicyResult =
  | { valid: true }
  | { valid: false; violations: string[] };

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const violations: string[] = [];

  if (password.length < MIN_LENGTH) {
    violations.push('Password must be at least 8 characters long');
  }
  if (!UPPERCASE_PATTERN.test(password)) {
    violations.push('Password must contain at least one uppercase letter');
  }
  if (!LOWERCASE_PATTERN.test(password)) {
    violations.push('Password must contain at least one lowercase letter');
  }
  if (!DIGIT_PATTERN.test(password)) {
    violations.push('Password must contain at least one number');
  }
  if (!SPECIAL_PATTERN.test(password)) {
    violations.push(
      'Password must contain at least one special character (e.g. @, #, $, %, ^, &, *)',
    );
  }

  if (violations.length > 0) {
    return { valid: false, violations };
  }

  return { valid: true };
}

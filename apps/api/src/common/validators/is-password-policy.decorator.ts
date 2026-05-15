import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validatePasswordPolicy } from './password-policy.validator';

@ValidatorConstraint({ name: 'isPasswordPolicy', async: false })
export class IsPasswordPolicyConstraint
  implements ValidatorConstraintInterface
{
  private violations: string[] = [];

  validate(password: string): boolean {
    const result = validatePasswordPolicy(password);
    if (result.valid) {
      this.violations = [];
      return true;
    }
    this.violations = result.violations;
    return false;
  }

  defaultMessage(): string {
    return (
      this.violations.join('; ') || 'Password does not meet policy requirements'
    );
  }
}

export function IsPasswordPolicy(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordPolicyConstraint,
    });
  };
}

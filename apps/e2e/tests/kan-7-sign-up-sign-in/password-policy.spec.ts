/// <reference types="node" />
import { test, expect } from '@playwright/test';
import {
  PASSWORD,
  TIMEOUT,
  uniqueUser,
  gotoRegister,
  fillRegisterForm,
  submitSignUp,
} from './helpers';

test.describe('Password policy enforced before register submit', () => {
  test('should block password shorter than 8 characters', async ({ page }) => {
    await gotoRegister(page);
    await fillRegisterForm(page, 'policy_short', 'Ab1!');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(
      page.getByText('Password must be at least 8 characters long'),
      'AC-7.4: short password error',
    ).toBeVisible({ timeout: TIMEOUT });
    await expect(page).toHaveURL('/register');
  });

  test('should block password without uppercase', async ({ page }) => {
    await gotoRegister(page);
    await fillRegisterForm(page, 'policy_noupper', 'str0ng!pass');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(
      page.getByText('Password must contain at least one uppercase letter'),
      'AC-7.4',
    ).toBeVisible({ timeout: TIMEOUT });
    await expect(page).toHaveURL('/register');
  });

  test('should block password without lowercase', async ({ page }) => {
    await gotoRegister(page);
    await fillRegisterForm(page, 'policy_nolower', 'STR0NG!PASS');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(
      page.getByText('Password must contain at least one lowercase letter'),
      'AC-7.4',
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test('should block password without digit', async ({ page }) => {
    await gotoRegister(page);
    await fillRegisterForm(page, 'policy_nodigit', 'Strong!pass');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(
      page.getByText('Password must contain at least one number'),
      'AC-7.4',
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test('should block password without special character', async ({ page }) => {
    await gotoRegister(page);
    await fillRegisterForm(page, 'policy_nospecial', 'Str0ngpass');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByText(/special character/), 'AC-7.4').toBeVisible({
      timeout: TIMEOUT,
    });
  });

  test('should not show client policy error for valid password', async ({
    page,
  }) => {
    const username = uniqueUser('policy_ok');

    await gotoRegister(page);
    await fillRegisterForm(page, username, PASSWORD);
    await expect(
      page.getByText('Password must be at least 8 characters'),
      'AC-7.3: no client policy error',
    ).toHaveCount(0);
    await submitSignUp(page);
    await page.waitForURL('/', { timeout: TIMEOUT, waitUntil: 'commit' });
    await expect(page, 'AC-7.4: reaches API outcome (redirect home)').toHaveURL(
      '/',
    );
  });
});

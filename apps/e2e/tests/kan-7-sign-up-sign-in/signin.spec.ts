/// <reference types="node" />
import { test, expect } from '@playwright/test';
import {
  TIMEOUT,
  uniqueUser,
  gotoLogin,
  gotoRegister,
  registerAndGoHome,
  loginAndGoHome,
  loginBodySignUpLink,
} from './helpers';

test.describe('Sign in functionality', () => {
  test('should render login UI', async ({ page }) => {
    await gotoLogin(page);
    await expect(page).toHaveURL('/login');

    await expect(
      page.getByRole('heading', { name: 'Sign in', level: 1 }),
      'AC-3.2: Sign in heading visible',
    ).toBeVisible({ timeout: TIMEOUT });
    await expect(
      page.getByRole('textbox', { name: 'Username' }),
      'AC-3.3: username field visible',
    ).toBeVisible({ timeout: TIMEOUT });
    await expect(
      page.getByRole('textbox', { name: 'Password' }),
      'AC-3.3: password field visible',
    ).toBeVisible({ timeout: TIMEOUT });
    await expect(
      page.getByRole('button', { name: 'Sign in' }),
      'AC-3.4: Sign in button visible',
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test('should redirect to home after successful login', async ({
    page,
  }) => {
    const username = uniqueUser('login_user');

    await gotoRegister(page);
    await registerAndGoHome(page, username);

    await gotoLogin(page);
    await loginAndGoHome(page, username);

    await expect(page, 'AC-3.5: redirected to home').toHaveURL('/', {
      timeout: TIMEOUT,
    });
    await expect(
      page.getByRole('heading', { name: 'Guest Book', level: 1 }),
      'AC-3.6: home heading visible',
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test('should link to sign-up from login UI', async ({
    page,
  }) => {
    await gotoLogin(page);
    await loginBodySignUpLink(page).click();

    await expect(page, 'AC-3.2: navigated to register').toHaveURL('/register');
    await expect(
      page.getByRole('heading', { name: 'Sign up', level: 1 }),
      'AC-3.3: Sign up heading visible',
    ).toBeVisible({ timeout: TIMEOUT });
  });
});

/// <reference types="node" />
import { test, expect } from '@playwright/test';
import {
  TIMEOUT,
  uniqueUser,
  gotoRegister,
  registerAndGoHome,
  registerBodySignInLink,
} from './helpers';

test.describe('Sign-up functionality', () => {
  test('should render registration UI', async ({ page }) => {
    // Step 1: Navigate to /register
    await gotoRegister(page);
    await expect(page, 'AC-1.1: register page loads').toHaveURL('/register');

    // Step 2: Observe heading and form
    await expect(
      page.getByRole('heading', { name: 'Sign up', level: 1 }),
      'AC-1.2: Sign up heading visible',
    ).toBeVisible({ timeout: TIMEOUT });

    // Step 3: Form fields visible
    await expect(
      page.getByRole('textbox', { name: 'Username' }),
      'AC-1.3: username field visible',
    ).toBeVisible({ timeout: TIMEOUT });
    await expect(
      page.getByRole('textbox', { name: 'Password' }),
      'AC-1.3: password field visible',
    ).toBeVisible({ timeout: TIMEOUT });

    // Step 4: Submit button visible
    await expect(
      page.getByRole('button', { name: 'Sign up' }),
      'AC-1.4: Sign up button visible',
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test('Should redirect to home after successful registration', async ({
    page,
  }) => {
    const username = uniqueUser('e2e_user');

    // Step 1: Navigate to /register
    await gotoRegister(page);
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible({
      timeout: TIMEOUT,
    });

    // Step 2–4: Register and redirect home
    await registerAndGoHome(page, username);
    await expect(page, 'AC-1.4: redirected to home after register').toHaveURL('/');

    // Step 5: Home content visible
    await expect(
      page.getByRole('heading', { name: 'Guest Book', level: 1 }),
      'AC-1.5: Guest Book heading on home',
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test('should link to sign-in from register UI', async ({
    page,
  }) => {
    // Step 1: Navigate to /register
    await gotoRegister(page);
    await expect(
      page.getByRole('heading', { name: 'Sign up', level: 1 }),
    ).toBeVisible({ timeout: TIMEOUT });

    // Step 2: Click body Sign in link
    await registerBodySignInLink(page).click();

    // Step 3: Login page visible
    await expect(page, 'AC-1.3: navigated to login').toHaveURL('/login');
    await expect(
      page.getByRole('heading', { name: 'Sign in', level: 1 }),
      'AC-1.3: Sign in heading visible',
    ).toBeVisible({ timeout: TIMEOUT });
  });
});

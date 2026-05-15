/// <reference types="node" />
import { test, expect } from '@playwright/test';
import {
  TIMEOUT,
  uniqueUser,
  appBar,
  gotoRegister,
  registerAndGoHome,
} from './helpers';

test.describe('Logout clears username and restores signed-out nav', () => {
  test('should restore guest nav after logout', async ({ page }) => {
    const username = uniqueUser('logout_user');

    await gotoRegister(page);
    await registerAndGoHome(page, username);

    const banner = appBar(page);
    await expect(banner.getByText(username)).toBeVisible({ timeout: TIMEOUT });

    const logoutResponse = page.waitForResponse(
      (r) => r.url().includes('/auth/logout'),
      { timeout: TIMEOUT },
    );
    await banner.getByRole('button', { name: 'Log out' }).click();
    await logoutResponse;

    await expect(banner.getByText(username), 'AC-6.3: username hidden').toHaveCount(0);
    await expect(banner.getByRole('link', { name: 'Sign in' }), 'AC-6.4').toBeVisible({
      timeout: TIMEOUT,
    });
    await expect(banner.getByRole('link', { name: 'Sign up' })).toBeVisible({
      timeout: TIMEOUT,
    });
    await expect(banner.getByRole('button', { name: 'Log out' })).toHaveCount(0);
  });

  test('should show signed-out nav after reload post-logout', async ({
    page,
  }) => {
    const username = uniqueUser('sess_logout');

    await gotoRegister(page);
    await registerAndGoHome(page, username);

    const logoutResponse = page.waitForResponse((r) => r.url().includes('/auth/logout'), {
      timeout: TIMEOUT,
    });
    await appBar(page).getByRole('button', { name: 'Log out' }).click();
    await logoutResponse;

    const sessionAfterLogout = page.waitForResponse((r) => r.url().includes('/auth/session'), {
      timeout: TIMEOUT,
    });
    await page.reload();
    await sessionAfterLogout;

    const banner = appBar(page);
    await expect(banner.getByRole('link', { name: 'Sign in' }), 'AC-6.4').toBeVisible({
      timeout: TIMEOUT,
    });
    await expect(banner.getByRole('link', { name: 'Sign up' })).toBeVisible({
      timeout: TIMEOUT,
    });
    await expect(banner.getByText(username)).toHaveCount(0);
  });
});

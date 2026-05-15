import { expect, test } from '@playwright/test';

test.describe('Guestbook home smoke', () => {
  test('shows Guest Book heading on the home page', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Guest Book' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Frontend foundation — Next.js, Material UI, and TanStack Query are configured.',
      ),
    ).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});

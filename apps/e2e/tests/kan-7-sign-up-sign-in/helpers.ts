import type { Locator, Page } from '@playwright/test';

export const PASSWORD = 'Str0ng!pass';

export const TIMEOUT = 5000;

export const uniqueUser = (prefix: string) => `${prefix}_${Date.now()}`;

/** WebKit often misses React onChange when using fill() on MUI controlled inputs. */
async function fillControlledInput(locator: Locator, value: string) {
  await locator.click();
  await locator.fill(value);
  await locator.evaluate((element, nextValue) => {
    const input = element as { value: string; dispatchEvent: (event: Event) => boolean };
    const valueSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(input),
      'value',
    )?.set;
    valueSetter?.call(input, nextValue);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

export async function gotoRegister(page: Page) {
  await page.goto('/register');
}

export async function gotoLogin(page: Page) {
  await page.goto('/login');
}

export async function fillRegisterForm(
  page: Page,
  username: string,
  password = PASSWORD,
) {
  await fillControlledInput(page.getByTestId('username-input'), username);
  await fillControlledInput(page.getByTestId('password-input'), password);
}

export async function fillLoginForm(
  page: Page,
  username: string,
  password = PASSWORD,
) {
  await fillControlledInput(page.getByTestId('username-input'), username);
  await fillControlledInput(page.getByTestId('password-input'), password);
}

export async function submitSignUp(page: Page) {
  const responsePromise = page.waitForResponse(
    (r) => r.url().includes('/auth/register') && r.request().method() === 'POST',
    { timeout: TIMEOUT },
  );
  await page.getByRole('button', { name: 'Sign up' }).click();
  const response = await responsePromise;
  if (!response.ok()) {
    throw new Error(
      `Registration failed: ${response.status()} ${await response.text()}`,
    );
  }
}

export async function registerAndGoHome(
  page: Page,
  username: string,
  password = PASSWORD,
) {
  await fillRegisterForm(page, username, password);
  await submitSignUp(page);
  await page.waitForURL('/', { timeout: TIMEOUT, waitUntil: 'commit' });
}

export async function submitSignIn(page: Page) {
  const responsePromise = page.waitForResponse(
    (r) => r.url().includes('/auth/login') && r.request().method() === 'POST',
    { timeout: TIMEOUT },
  );
  await page.getByRole('button', { name: 'Sign in' }).click();
  const response = await responsePromise;
  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
  }
}

export async function loginAndGoHome(
  page: Page,
  username: string,
  password = PASSWORD,
) {
  await fillLoginForm(page, username, password);
  await submitSignIn(page);
  await page.waitForURL('/', { timeout: TIMEOUT, waitUntil: 'commit' });
}

export function registerBodySignInLink(page: Page) {
  return page
    .getByRole('paragraph')
    .filter({ hasText: 'Already have an account?' })
    .getByRole('link', { name: 'Sign in' });
}

export function loginBodySignUpLink(page: Page) {
  return page
    .getByRole('paragraph')
    .filter({ hasText: 'Need an account?' })
    .getByRole('link', { name: 'Sign up' });
}

export function appBar(page: Page) {
  return page.getByRole('banner');
}

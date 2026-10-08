const { test, expect } = require('@playwright/test');

test.describe('Socify Core QA Test Suite', () => {
  const credentials = {
    email: 'qa4@yopmail.com',
    password: '!soL@45#'
  };

  test('TC-AUTH-01: valid login and workspace resolution', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#login-email').fill(credentials.email);
    await page.getByRole('button', { name: /continue with email/i }).click();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill(credentials.password);

    await page.getByRole('button', { name: /sign in|log in|continue/i }).click();
    await expect(page).not.toHaveURL(/\/login(?!\?)/, { timeout: 15000 });
  });

  test('TC-AUTH-02: invalid password shows error', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#login-email').fill(credentials.email);
    await page.getByRole('button', { name: /continue with email/i }).click();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('WrongPass@999');

    await page.getByRole('button', { name: /sign in|log in|continue/i }).click();
    await expect(page.locator('text=Password is wrong or incorrect.')).toBeVisible({ timeout: 5000 });
  });

  test('TC-CRM-05: edit customer phone and verify persistence after reload', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill(credentials.email);
    await page.getByRole('button', { name: /continue with email/i }).click();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(credentials.password);
    await page.getByRole('button', { name: /sign in|log in|continue/i }).click();

    await page.waitForLoadState('networkidle');
    await page.goto('/socify/contacts');

    const customerTable = page.locator('table, [role="table"], div[class*="table"]').first();
    await expect(customerTable).toBeVisible({ timeout: 15000 });

    const editBtn = page.getByRole('button', { name: /edit/i }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();

      const phoneField = page.locator('input[name*="phone"], input[placeholder*="phone" i]').first();
      await expect(phoneField).toBeVisible();

      const newPhone = '9849999999';
      await phoneField.fill(newPhone);

      await page.getByRole('button', { name: /save|update/i }).click();
      await expect(page.locator('text=Saved successfully')).toBeVisible({ timeout: 5000 });

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Regression check for BUG-001 (reverted phone number on refresh)
      await expect(page.locator(`text=${newPhone}`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-DASH-01: dashboard buttons route check', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill(credentials.email);
    await page.getByRole('button', { name: /continue with email/i }).click();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(credentials.password);
    await page.getByRole('button', { name: /sign in|log in|continue/i }).click();

    await page.waitForLoadState('networkidle');
    await page.goto('/socify/dashboard');

    const openInboxBtn = page.getByRole('button', { name: /open inbox|active threads inbox/i }).first();
    if (await openInboxBtn.isVisible()) {
      await openInboxBtn.click();
      await expect(page).toHaveURL(/.*\/inbox/, { timeout: 5000 });
    }
  });

  test('TC-API-01: openapi schema endpoint health', async ({ request }) => {
    const response = await request.get('https://api.dev.moaaapp.com/api/schema/');
    expect(response.status()).toBe(200);
  });
});

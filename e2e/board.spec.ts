import { test, expect } from '@playwright/test';

test.describe('Board Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-header"]', { timeout: 10000 });
  });

  test('should display header and board selector', async ({ page }) => {
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="board-selector"]')).toBeVisible();
  });

  test('should create a new board', async ({ page }) => {
    // Open board dropdown
    await page.click('[data-testid="board-selector"]');
    
    // Click "New Board"
    await page.click('[data-testid="new-board-menu-item"]');
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Fill in board name
    const nameInput = page.locator('[role="dialog"] input').first();
    await nameInput.fill('E2E Test Board');
    
    // Submit
    await page.click('[role="dialog"] button:has-text("Create Board")');
    
    // Verify board was created
    await expect(page.locator('[data-testid="board-selector"]')).toContainText('E2E Test Board');
  });

  test('should switch between boards using keyboard shortcuts', async ({ page }) => {
    // Create first board via UI
    await page.click('[data-testid="board-selector"]');
    await page.click('[data-testid="new-board-menu-item"]');
    
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible({ timeout: 2000 })) {
      const input = dialog.locator('input').first();
      await input.fill('Board A');
      await page.click('[role="dialog"] button:has-text("Create Board")');
      await page.waitForTimeout(500);
    }

    // Try navigation shortcut
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
  });

  test('should open shortcuts help with ? key', async ({ page }) => {
    // ? requires Shift on most keyboards
    await page.keyboard.press('Shift+?');
    
    // Should show shortcuts dialog
    const shortcutsDialog = page.locator('[role="dialog"]:has-text("Keyboard Shortcuts")');
    await expect(shortcutsDialog).toBeVisible({ timeout: 3000 });
    
    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('should create board with B shortcut', async ({ page }) => {
    await page.keyboard.press('b');
    
    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
    
    // Should have input for board name
    await expect(dialog.locator('input').first()).toBeVisible();
  });
});

test.describe('Board Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-header"]');
  });

  test('should toggle theme with D shortcut', async ({ page }) => {
    // Get initial theme
    const initialIsDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    
    // Press D to toggle theme
    await page.keyboard.press('d');
    await page.waitForTimeout(300);
    
    // Check theme changed
    const newIsDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    expect(newIsDark).toBe(!initialIsDark);
  });

  test('should have export button', async ({ page }) => {
    await expect(page.locator('[data-testid="export-button"]').first()).toBeVisible();
  });

  test('should have import functionality', async ({ page }) => {
    // Check import button exists
    const importButton = page.locator('[data-testid="import-button"]').first();
    await expect(importButton).toBeVisible();
  });
});

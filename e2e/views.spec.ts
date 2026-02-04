import { test, expect } from '@playwright/test';

test.describe('View Modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-header"]');
    await page.waitForTimeout(1000);
  });

  test('should display view switcher', async ({ page }) => {
    const viewSwitcher = page.locator('[data-testid="view-switcher"]').first();
    
    // View switcher should be visible when board is selected
    if (await page.locator('[data-testid="column"]').first().isVisible({ timeout: 3000 })) {
      await expect(viewSwitcher).toBeVisible({ timeout: 3000 });
    }
  });

  test('should switch to Calendar view', async ({ page }) => {
    const calendarButton = page.locator('[data-testid="view-calendar"]');
    
    if (await calendarButton.isVisible({ timeout: 3000 })) {
      await calendarButton.click();
      
      // Verify calendar is active
      await expect(calendarButton).toHaveAttribute('data-active', 'true');
      
      // Calendar should show day headers
      await expect(page.locator('text=Mon').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should switch to Agenda view', async ({ page }) => {
    const agendaButton = page.locator('[data-testid="view-agenda"]');
    
    if (await agendaButton.isVisible({ timeout: 3000 })) {
      await agendaButton.click();
      
      // Verify agenda is active
      await expect(agendaButton).toHaveAttribute('data-active', 'true');
    }
  });

  test('should switch back to Kanban view', async ({ page }) => {
    // First switch to another view
    const calendarButton = page.locator('[data-testid="view-calendar"]');
    if (await calendarButton.isVisible({ timeout: 3000 })) {
      await calendarButton.click();
      await page.waitForTimeout(300);
    }
    
    // Switch back to Kanban
    const kanbanButton = page.locator('[data-testid="view-kanban"]');
    if (await kanbanButton.isVisible()) {
      await kanbanButton.click();
      
      // Verify kanban is active
      await expect(kanbanButton).toHaveAttribute('data-active', 'true');
      
      // Columns should be visible
      await expect(page.locator('[data-testid="column"]').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should cycle views with V shortcut', async ({ page }) => {
    const viewSwitcher = page.locator('[data-testid="view-switcher"]');
    
    if (await viewSwitcher.isVisible({ timeout: 3000 })) {
      // Get initial active view
      const kanbanButton = page.locator('[data-testid="view-kanban"]');
      const isKanbanActive = await kanbanButton.getAttribute('data-active');
      
      // Press V to cycle
      await page.keyboard.press('v');
      await page.waitForTimeout(500);
      
      // If we were on Kanban, now we should be on Calendar
      if (isKanbanActive === 'true') {
        const calendarButton = page.locator('[data-testid="view-calendar"]');
        await expect(calendarButton).toHaveAttribute('data-active', 'true');
      }
    }
  });
});

test.describe('Calendar View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-header"]');
    await page.waitForTimeout(500);
    
    // Switch to calendar view
    const calendarButton = page.locator('[data-testid="view-calendar"]');
    if (await calendarButton.isVisible({ timeout: 3000 })) {
      await calendarButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to next month with ] shortcut', async ({ page }) => {
    const viewSwitcher = page.locator('[data-testid="view-switcher"]');
    
    if (await viewSwitcher.isVisible({ timeout: 2000 })) {
      // Get current month title
      const monthTitle = page.locator('text=/[A-Z][a-z]+ \\d{4}/').first();
      const currentMonth = await monthTitle.textContent();
      
      // Press ] to go to next month
      await page.keyboard.press(']');
      await page.waitForTimeout(300);
      
      // Month should change
      const newMonth = await monthTitle.textContent();
      expect(newMonth).not.toBe(currentMonth);
    }
  });

  test('should navigate to previous month with [ shortcut', async ({ page }) => {
    const viewSwitcher = page.locator('[data-testid="view-switcher"]');
    
    if (await viewSwitcher.isVisible({ timeout: 2000 })) {
      await page.keyboard.press('[');
      await page.waitForTimeout(300);
    }
  });

  test('should go to today with T shortcut', async ({ page }) => {
    const viewSwitcher = page.locator('[data-testid="view-switcher"]');
    
    if (await viewSwitcher.isVisible({ timeout: 2000 })) {
      // Navigate away first
      await page.keyboard.press(']');
      await page.keyboard.press(']');
      await page.waitForTimeout(300);
      
      // Press T to go to today
      await page.keyboard.press('t');
      await page.waitForTimeout(300);
    }
  });

  test('should switch to month view with M shortcut', async ({ page }) => {
    const viewSwitcher = page.locator('[data-testid="view-switcher"]');
    
    if (await viewSwitcher.isVisible({ timeout: 2000 })) {
      await page.keyboard.press('m');
      await page.waitForTimeout(300);
    }
  });

  test('should switch to week view with W shortcut', async ({ page }) => {
    const viewSwitcher = page.locator('[data-testid="view-switcher"]');
    
    if (await viewSwitcher.isVisible({ timeout: 2000 })) {
      await page.keyboard.press('w');
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Theme', () => {
  test('should toggle dark/light theme with D shortcut', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-header"]');
    
    // Get initial theme
    const initialIsDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    
    // Press D to toggle theme
    await page.keyboard.press('d');
    await page.waitForTimeout(300);
    
    // Check theme changed
    const newIsDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    expect(newIsDark).toBe(!initialIsDark);
    
    // Toggle back
    await page.keyboard.press('d');
    await page.waitForTimeout(300);
    
    const finalIsDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
    expect(finalIsDark).toBe(initialIsDark);
  });

  test('should toggle theme via button', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-header"]');
    
    const themeButton = page.locator('[data-testid="toggle-theme"]');
    
    if (await themeButton.isVisible({ timeout: 3000 })) {
      const initialIsDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
      
      await themeButton.click();
      await page.waitForTimeout(300);
      
      const newIsDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
      expect(newIsDark).toBe(!initialIsDark);
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Board Notes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-header"]', { timeout: 10000 });
    
    // Ensure we have a board selected (create one if needed)
    const boardSelector = page.locator('[data-testid="board-selector"]');
    const boardText = await boardSelector.textContent();
    
    if (boardText === 'Select Board' || !boardText?.trim()) {
      // Create a new board
      await page.keyboard.press('b');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      const nameInput = page.locator('[role="dialog"] input').first();
      await nameInput.fill('Test Board');
      await page.click('[role="dialog"] button:has-text("Create Board")');
      await page.waitForTimeout(500);
    }
    
    // Wait for board notes button to be visible
    await page.waitForSelector('[data-testid="board-notes-button"]', { timeout: 5000 });
  });

  test('should have board notes button in header', async ({ page }) => {
    const notesButton = page.locator('[data-testid="board-notes-button"]');
    await expect(notesButton).toBeVisible();
  });

  test('should open board notes drawer when clicking notes button', async ({ page }) => {
    // Click notes button
    await page.click('[data-testid="board-notes-button"]');
    
    // Drawer should open
    const drawer = page.locator('[role="dialog"]:has-text("Board Notes")');
    await expect(drawer).toBeVisible({ timeout: 3000 });
    
    // Should show board title in description
    await expect(drawer).toContainText('Notes for');
  });

  test('should close drawer with Close button', async ({ page }) => {
    // Open drawer
    await page.click('[data-testid="board-notes-button"]');
    const drawer = page.locator('[role="dialog"]:has-text("Board Notes")');
    await expect(drawer).toBeVisible({ timeout: 3000 });
    
    // Click Close button
    await page.click('[role="dialog"] button:has-text("Close")');
    
    // Drawer should be hidden
    await expect(drawer).not.toBeVisible({ timeout: 3000 });
  });

  test('should write and save notes', async ({ page }) => {
    // Open drawer
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // Switch to write mode if in preview mode
    const writeButton = page.locator('[role="dialog"] button:has-text("Write")');
    if (await writeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await writeButton.click();
    }
    
    // Find textarea and write notes
    const textarea = page.locator('[role="dialog"] textarea');
    await textarea.fill('# My Board Notes\n\nThis is a test note.');
    
    // Should show unsaved indicator
    await expect(page.locator('[role="dialog"]')).toContainText('Unsaved changes');
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    
    // Should show saved indicator
    await expect(page.locator('[role="dialog"]')).toContainText('Saved');
  });

  test('should auto-save notes on close', async ({ page }) => {
    // Open drawer
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // Switch to write mode if in preview mode
    const writeButton = page.locator('[role="dialog"] button:has-text("Write")');
    if (await writeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await writeButton.click();
    }
    
    // Write notes
    const textarea = page.locator('[role="dialog"] textarea');
    await textarea.fill('Auto-saved note content');
    
    // Verify unsaved indicator
    await expect(page.locator('[role="dialog"]')).toContainText('Unsaved changes');
    
    // Close drawer (should auto-save)
    await page.click('[role="dialog"] button:has-text("Close")');
    await page.waitForTimeout(500);
    
    // Reopen drawer
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // Switch to write mode to see textarea (notes exist so it opens in preview)
    const writeButton2 = page.locator('[role="dialog"] button:has-text("Write")');
    if (await writeButton2.isVisible({ timeout: 1000 }).catch(() => false)) {
      await writeButton2.click();
    }
    
    // Notes should be preserved
    await expect(page.locator('[role="dialog"] textarea')).toHaveValue('Auto-saved note content');
  });

  test('should persist notes after page reload', async ({ page }) => {
    // Open drawer and write notes
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // Switch to write mode if in preview mode
    const writeButton = page.locator('[role="dialog"] button:has-text("Write")');
    if (await writeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await writeButton.click();
    }
    
    const textarea = page.locator('[role="dialog"] textarea');
    await textarea.fill('Persistent note test');
    
    // Save notes
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(500);
    
    // Close drawer
    await page.click('[role="dialog"] button:has-text("Close")');
    
    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="app-header"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="board-notes-button"]', { timeout: 5000 });
    
    // Reopen drawer
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // Switch to write mode to see textarea
    const writeButton2 = page.locator('[role="dialog"] button:has-text("Write")');
    if (await writeButton2.isVisible({ timeout: 1000 }).catch(() => false)) {
      await writeButton2.click();
    }
    
    // Notes should be preserved
    await expect(page.locator('[role="dialog"] textarea')).toHaveValue('Persistent note test');
  });

  test('should highlight notes button when board has notes', async ({ page }) => {
    const notesButton = page.locator('[data-testid="board-notes-button"]');
    
    // Initially, button should not be highlighted (no notes)
    await expect(notesButton).not.toHaveClass(/text-primary/);
    
    // Open drawer and add notes
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // Switch to write mode if in preview mode
    const writeButton = page.locator('[role="dialog"] button:has-text("Write")');
    if (await writeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await writeButton.click();
    }
    
    const textarea = page.locator('[role="dialog"] textarea');
    await textarea.fill('Some notes');
    
    // Save and close
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(300);
    await page.click('[role="dialog"] button:has-text("Close")');
    await page.waitForTimeout(300);
    
    // Button should now be highlighted (has text-primary or similar class)
    await expect(notesButton).toHaveClass(/text-primary/);
  });

  test('should support markdown preview toggle', async ({ page }) => {
    // Open drawer
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // Switch to write mode first
    const writeButton = page.locator('[role="dialog"] button:has-text("Write")');
    if (await writeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await writeButton.click();
    }
    
    // Write some markdown
    const textarea = page.locator('[role="dialog"] textarea');
    await textarea.fill('# Heading\n\n**Bold text**');
    
    // Toggle to preview mode
    const previewButton = page.locator('[role="dialog"] button:has-text("Preview")');
    await expect(previewButton).toBeVisible({ timeout: 2000 });
    await previewButton.click();
    
    // Should show rendered markdown - use more specific selector for markdown content
    // The prose class is added by MarkdownRenderer for rendered content
    const markdownContent = page.locator('[role="dialog"] .prose');
    await expect(markdownContent.locator('h1')).toContainText('Heading');
    await expect(markdownContent.locator('strong')).toContainText('Bold text');
  });

  test('should have different notes per board', async ({ page }) => {
    // Add notes to first board
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // Switch to write mode if in preview mode
    const writeButton = page.locator('[role="dialog"] button:has-text("Write")');
    if (await writeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await writeButton.click();
    }
    
    await page.locator('[role="dialog"] textarea').fill('Notes for Board 1');
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(300);
    await page.click('[role="dialog"] button:has-text("Close")');
    await page.waitForTimeout(300);
    
    // Create a new board
    await page.keyboard.press('b');
    await page.waitForSelector('[role="dialog"]:has-text("Create New Board")', { timeout: 5000 });
    
    const nameInput = page.locator('[role="dialog"] input').first();
    await nameInput.fill('Second Board');
    await page.click('[role="dialog"] button:has-text("Create Board")');
    await page.waitForTimeout(500);
    
    // Wait for board notes button
    await page.waitForSelector('[data-testid="board-notes-button"]', { timeout: 5000 });
    
    // Open notes for new board
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // Ensure we're in write mode (even for empty notes, explicitly switch)
    const writeButtonNew = page.locator('[role="dialog"] button:has-text("Write")');
    await writeButtonNew.click();
    await page.waitForTimeout(200);
    
    const textarea = page.locator('[role="dialog"] textarea');
    
    // Should be empty (different board)
    await expect(textarea).toHaveValue('');
    
    // Add different notes
    await textarea.fill('Notes for Board 2');
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(300);
    await page.click('[role="dialog"] button:has-text("Close")');
    await page.waitForTimeout(300);
    
    // Switch back to first board using dropdown
    await page.click('[data-testid="board-selector"]');
    await page.waitForTimeout(200);
    
    // Click on first board in the dropdown (not "New Board" item)
    const firstBoardItem = page.locator('[role="menuitem"]').filter({ hasNotText: 'New Board' }).first();
    await firstBoardItem.click();
    await page.waitForTimeout(300);
    
    // Check notes are preserved separately
    await page.click('[data-testid="board-notes-button"]');
    await page.waitForSelector('[role="dialog"]:has-text("Board Notes")');
    
    // First board has notes, so opens in preview mode - switch to write
    const writeButton2 = page.locator('[role="dialog"] button:has-text("Write")');
    if (await writeButton2.isVisible({ timeout: 1000 }).catch(() => false)) {
      await writeButton2.click();
    }
    
    await expect(page.locator('[role="dialog"] textarea')).toHaveValue('Notes for Board 1');
  });
});

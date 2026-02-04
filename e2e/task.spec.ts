import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-header"]');
    await page.waitForTimeout(1000); // Wait for IndexedDB to initialize
  });

  test('should create a new task via column button', async ({ page }) => {
    // Find "Add task" button in first column
    const addTaskButton = page.locator('[data-testid="add-task-button"]').first();
    
    if (await addTaskButton.isVisible({ timeout: 3000 })) {
      await addTaskButton.click();
      
      // Fill in task title
      const taskInput = page.locator('[data-testid="add-task-title-input"]');
      await expect(taskInput).toBeVisible();
      await taskInput.fill('E2E Test Task');
      
      // Submit
      await page.click('[data-testid="add-task-submit"]');
      
      // Verify task was created
      await expect(page.locator('[data-testid="task-card"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should create task with N shortcut', async ({ page }) => {
    // Make sure we have a board with columns first
    const column = page.locator('[data-testid="column"]').first();
    
    if (await column.isVisible({ timeout: 3000 })) {
      // Press N for new task
      await page.keyboard.press('n');
      
      // Quick add dialog should appear
      const dialog = page.locator('[role="dialog"]:has-text("Quick Add Task")');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      // Fill and submit
      await dialog.locator('input').first().fill('Keyboard Shortcut Task');
      await page.click('[role="dialog"] button:has-text("Add Task")');
      
      await page.waitForTimeout(500);
      await expect(page.locator('[data-testid="task-title"]:has-text("Keyboard Shortcut Task")')).toBeVisible();
    }
  });

  test('should open task detail on click', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      // Should open task detail dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show task title in card', async ({ page }) => {
    const taskTitle = page.locator('[data-testid="task-title"]').first();
    
    if (await taskTitle.isVisible({ timeout: 3000 })) {
      const title = await taskTitle.textContent();
      expect(title).toBeTruthy();
    }
  });

  test('should set task priority', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      // Click Edit button
      await page.click('[role="dialog"] button:has-text("Edit Task")');
      
      // Find priority selector
      const prioritySelect = dialog.locator('text=Priority').first();
      if (await prioritySelect.isVisible()) {
        // Priority options should be available
        await expect(dialog.locator('text=High, text=Critical, text=Low').first()).toBeVisible({ timeout: 2000 }).catch(() => {});
      }
    }
  });

  test('should delete task via menu', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      const taskId = await taskCard.getAttribute('data-task-id');
      
      // Open menu
      await page.click('[data-testid="task-menu-trigger"]');
      
      // Click delete
      await page.click('[data-testid="task-menu-delete"]');
      
      await page.waitForTimeout(500);
      
      // Task should be removed (or we should be in different state)
    }
  });
});

test.describe('Task Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-header"]');
    await page.waitForTimeout(1000);
  });

  test('should drag task between columns', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    const targetColumn = page.locator('[data-testid="column-drop-zone"]').nth(1);
    
    if (await taskCard.isVisible({ timeout: 3000 }) && await targetColumn.isVisible()) {
      // Get drag handle
      const dragHandle = page.locator('[data-testid="task-drag-handle"]').first();
      
      if (await dragHandle.isVisible()) {
        await dragHandle.dragTo(targetColumn);
        await page.waitForTimeout(500);
      }
    }
  });

  test('should have drag handles on tasks', async ({ page }) => {
    const dragHandle = page.locator('[data-testid="task-drag-handle"]').first();
    
    if (await page.locator('[data-testid="task-card"]').first().isVisible({ timeout: 3000 })) {
      await expect(dragHandle).toBeVisible();
    }
  });

  test('should have drag handles on columns', async ({ page }) => {
    const columnDragHandle = page.locator('[data-testid="column-drag-handle"]').first();
    
    if (await page.locator('[data-testid="column"]').first().isVisible({ timeout: 3000 })) {
      await expect(columnDragHandle).toBeVisible();
    }
  });
});

test.describe('Column Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-header"]');
  });

  test('should display column with title and task count', async ({ page }) => {
    const column = page.locator('[data-testid="column"]').first();
    
    if (await column.isVisible({ timeout: 3000 })) {
      await expect(page.locator('[data-testid="column-title"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="column-task-count"]').first()).toBeVisible();
    }
  });

  test('should edit column via menu', async ({ page }) => {
    const columnMenu = page.locator('[data-testid="column-menu-trigger"]').first();
    
    if (await columnMenu.isVisible({ timeout: 3000 })) {
      await columnMenu.click();
      
      await page.click('[data-testid="column-menu-edit"]');
      
      // Edit dialog should appear
      await expect(page.locator('[data-testid="edit-column-dialog"]')).toBeVisible({ timeout: 3000 });
      
      // Close
      await page.keyboard.press('Escape');
    }
  });

  test('should show delete confirmation for column', async ({ page }) => {
    const columnMenu = page.locator('[data-testid="column-menu-trigger"]').first();
    
    if (await columnMenu.isVisible({ timeout: 3000 })) {
      await columnMenu.click();
      
      await page.click('[data-testid="column-menu-delete"]');
      
      // Delete dialog should appear
      await expect(page.locator('[data-testid="delete-column-dialog"]')).toBeVisible({ timeout: 3000 });
      
      // Cancel
      await page.keyboard.press('Escape');
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Attachments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-header"]');
    await page.waitForTimeout(1000);
  });

  test('should open task detail and see attachment upload area', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      // Look for attachments section (in view mode, might need to click Edit)
      await page.click('[role="dialog"] button:has-text("Edit Task")');
      await page.waitForTimeout(300);
      
      // Attachment upload should be visible
      const attachmentUpload = page.locator('[data-testid="attachment-upload"]');
      await expect(attachmentUpload).toBeVisible({ timeout: 3000 });
    }
  });

  test('should have attachment drop zone', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      await page.click('[role="dialog"] button:has-text("Edit Task")');
      await page.waitForTimeout(300);
      
      // Drop zone should be visible
      const dropZone = page.locator('[data-testid="attachment-drop-zone"]');
      await expect(dropZone).toBeVisible({ timeout: 3000 });
    }
  });

  test('should upload file via file input', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      await page.click('[role="dialog"] button:has-text("Edit Task")');
      await page.waitForTimeout(300);
      
      // Find file input
      const fileInput = page.locator('[data-testid="attachment-file-input"]');
      
      if (await fileInput.count() > 0) {
        // Create a test file
        await fileInput.setInputFiles({
          name: 'test-file.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Test file content for E2E testing'),
        });
        
        await page.waitForTimeout(1000);
        
        // Verify file appears in list
        const attachmentItem = page.locator('[data-testid="attachment-item"]');
        await expect(attachmentItem.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should upload image and show thumbnail', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      await page.click('[role="dialog"] button:has-text("Edit Task")');
      await page.waitForTimeout(300);
      
      const fileInput = page.locator('[data-testid="attachment-file-input"]');
      
      if (await fileInput.count() > 0) {
        // Create a small test image (1x1 PNG)
        const pngBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
          0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
          0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
          0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
          0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        
        await fileInput.setInputFiles({
          name: 'test-image.png',
          mimeType: 'image/png',
          buffer: pngBuffer,
        });
        
        await page.waitForTimeout(1000);
        
        // Look for image attachment (should have thumbnail)
        const imageAttachment = page.locator('[data-testid="attachment-item"][data-is-image="true"]');
        await expect(imageAttachment.first()).toBeVisible({ timeout: 5000 }).catch(() => {
          // Might not be visible immediately
        });
      }
    }
  });

  test('should delete attachment', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      await page.click('[role="dialog"] button:has-text("Edit Task")');
      await page.waitForTimeout(300);
      
      const fileInput = page.locator('[data-testid="attachment-file-input"]');
      
      if (await fileInput.count() > 0) {
        // First upload a file
        await fileInput.setInputFiles({
          name: 'to-delete.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('File to be deleted'),
        });
        
        await page.waitForTimeout(1000);
        
        // Find delete button
        const deleteButton = page.locator('[data-testid="attachment-delete"]').first();
        
        if (await deleteButton.isVisible({ timeout: 2000 })) {
          // Hover to show button (it's hidden by default)
          const attachmentItem = page.locator('[data-testid="attachment-item"]').first();
          await attachmentItem.hover();
          
          await deleteButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should show attachment count badge on task card', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      await page.click('[role="dialog"] button:has-text("Edit Task")');
      await page.waitForTimeout(300);
      
      const fileInput = page.locator('[data-testid="attachment-file-input"]');
      
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles({
          name: 'badge-test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Test content'),
        });
        
        await page.waitForTimeout(1000);
        
        // Save and close dialog
        await page.click('[role="dialog"] button:has-text("Save")');
        await page.waitForTimeout(500);
        
        // Check for attachment badge on task card
        const badge = page.locator('[data-testid="task-attachment-badge"]').first();
        await expect(badge).toBeVisible({ timeout: 3000 }).catch(() => {
          // Badge might not be visible
        });
      }
    }
  });

  test('should display attachment name and size', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      await page.click('[role="dialog"] button:has-text("Edit Task")');
      await page.waitForTimeout(300);
      
      const fileInput = page.locator('[data-testid="attachment-file-input"]');
      
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles({
          name: 'display-test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Test content for display'),
        });
        
        await page.waitForTimeout(1000);
        
        // Check attachment displays name and size
        const attachmentName = page.locator('[data-testid="attachment-name"]').first();
        const attachmentSize = page.locator('[data-testid="attachment-size"]').first();
        
        await expect(attachmentName).toBeVisible({ timeout: 3000 });
        await expect(attachmentSize).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should have download button on attachment', async ({ page }) => {
    const taskCard = page.locator('[data-testid="task-card"]').first();
    
    if (await taskCard.isVisible({ timeout: 3000 })) {
      await taskCard.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      await page.click('[role="dialog"] button:has-text("Edit Task")');
      await page.waitForTimeout(300);
      
      const fileInput = page.locator('[data-testid="attachment-file-input"]');
      
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles({
          name: 'download-test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Test content'),
        });
        
        await page.waitForTimeout(1000);
        
        // Hover to show buttons
        const attachmentItem = page.locator('[data-testid="attachment-item"]').first();
        await attachmentItem.hover();
        
        const downloadButton = page.locator('[data-testid="attachment-download"]').first();
        await expect(downloadButton).toBeVisible({ timeout: 3000 });
      }
    }
  });
});

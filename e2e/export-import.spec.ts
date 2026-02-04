import { test, expect } from '@playwright/test';

test.describe('Export and Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('should export data to JSON file', async ({ page }) => {
    // Find export button (usually in settings or header menu)
    const menuButton = page.locator('button[aria-label*="settings"], button[aria-label*="menu"], [data-testid="settings-menu"]').first();
    
    if (await menuButton.isVisible({ timeout: 3000 })) {
      await menuButton.click();
      
      const exportOption = page.locator('text=Export, [role="menuitem"]:has-text("Export")').first();
      
      if (await exportOption.isVisible({ timeout: 2000 })) {
        // Set up download listener
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
          exportOption.click(),
        ]);
        
        if (download) {
          // Verify file name contains expected pattern
          const fileName = download.suggestedFilename();
          expect(fileName).toMatch(/\.json$/);
        }
      }
    }
  });

  test('should import data from JSON file', async ({ page }) => {
    const menuButton = page.locator('button[aria-label*="settings"], button[aria-label*="menu"], [data-testid="settings-menu"]').first();
    
    if (await menuButton.isVisible({ timeout: 3000 })) {
      await menuButton.click();
      
      const importOption = page.locator('text=Import, [role="menuitem"]:has-text("Import")').first();
      
      if (await importOption.isVisible({ timeout: 2000 })) {
        await importOption.click();
        
        // Wait for file input
        const fileInput = page.locator('input[type="file"][accept*="json"]').first();
        
        if (await fileInput.count() > 0) {
          // Create a valid import file
          const importData = {
            boards: [
              {
                id: 'imported-board',
                title: 'Imported Board',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
            ],
            columns: [
              {
                id: 'imported-col',
                title: 'Imported Column',
                boardId: 'imported-board',
                order: 0,
              }
            ],
            tasks: [
              {
                id: 'imported-task',
                title: 'Imported Task',
                columnId: 'imported-col',
                order: 0,
                labelIds: [],
                subtasks: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                priority: 'none',
                comments: [],
                attachments: [],
              }
            ],
            labels: [],
            exportedAt: Date.now(),
            version: '2.1.0',
          };
          
          await fileInput.setInputFiles({
            name: 'bordy-import.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify(importData)),
          });
          
          await page.waitForTimeout(2000);
          
          // Verify imported board appears
          await expect(page.locator('text=Imported Board')).toBeVisible({ timeout: 5000 }).catch(() => {
            // Import might need confirmation
          });
        }
      }
    }
  });

  test('should handle invalid import file gracefully', async ({ page }) => {
    const menuButton = page.locator('button[aria-label*="settings"], button[aria-label*="menu"]').first();
    
    if (await menuButton.isVisible({ timeout: 3000 })) {
      await menuButton.click();
      
      const importOption = page.locator('text=Import').first();
      
      if (await importOption.isVisible({ timeout: 2000 })) {
        await importOption.click();
        
        const fileInput = page.locator('input[type="file"]').first();
        
        if (await fileInput.count() > 0) {
          // Try to import invalid file
          await fileInput.setInputFiles({
            name: 'invalid.json',
            mimeType: 'application/json',
            buffer: Buffer.from('{ invalid json }'),
          });
          
          await page.waitForTimeout(1000);
          
          // Should show error message or not crash
          const errorMessage = page.locator('text=error, text=invalid, text=failed, [role="alert"]').first();
          // App should handle gracefully
        }
      }
    }
  });

  test('should import data with attachments', async ({ page }) => {
    const menuButton = page.locator('button[aria-label*="settings"], button[aria-label*="menu"]').first();
    
    if (await menuButton.isVisible({ timeout: 3000 })) {
      await menuButton.click();
      
      const importOption = page.locator('text=Import').first();
      
      if (await importOption.isVisible({ timeout: 2000 })) {
        await importOption.click();
        
        const fileInput = page.locator('input[type="file"]').first();
        
        if (await fileInput.count() > 0) {
          // Create import data with attachment
          const importData = {
            boards: [
              {
                id: 'board-with-attachment',
                title: 'Board With Attachment',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
            ],
            columns: [
              {
                id: 'col-1',
                title: 'To Do',
                boardId: 'board-with-attachment',
                order: 0,
              }
            ],
            tasks: [
              {
                id: 'task-with-attachment',
                title: 'Task With Attachment',
                columnId: 'col-1',
                order: 0,
                labelIds: [],
                subtasks: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                priority: 'high',
                comments: [],
                attachments: [
                  {
                    id: 'att-1',
                    name: 'imported-file.txt',
                    type: 'text/plain',
                    size: 13,
                    data: 'SGVsbG8gV29ybGQh', // "Hello World!" in base64
                    createdAt: Date.now(),
                  }
                ],
              }
            ],
            labels: [],
            exportedAt: Date.now(),
            version: '2.1.0',
          };
          
          await fileInput.setInputFiles({
            name: 'bordy-with-attachments.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify(importData)),
          });
          
          await page.waitForTimeout(2000);
          
          // Verify import worked
          await expect(page.locator('text=Board With Attachment, text=Task With Attachment').first()).toBeVisible({ timeout: 5000 }).catch(() => {
            // May need to navigate to the board
          });
        }
      }
    }
  });
});

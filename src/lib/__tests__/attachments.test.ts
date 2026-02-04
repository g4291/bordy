import {
  fileToBase64,
  validateFile,
  createAttachment,
  getDataUrl,
} from '../attachments';
import { ATTACHMENT_CONFIG } from '../../types';

// Mock File
const createMockFile = (
  name: string,
  size: number,
  type: string,
  content: string = 'mock content'
): File => {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
};

// Mock FileReader
const mockFileReaderResult = 'data:image/png;base64,mockBase64Data';

class MockFileReader {
  result: string | null = null;
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  readAsDataURL(blob: Blob) {
    setTimeout(() => {
      this.result = mockFileReaderResult;
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
}

// Replace global FileReader
const originalFileReader = global.FileReader;

describe('Attachments Utils', () => {
  beforeAll(() => {
    (global as any).FileReader = MockFileReader;
  });

  afterAll(() => {
    (global as any).FileReader = originalFileReader;
  });

  describe('validateFile', () => {
    it('should accept files under max size', () => {
      const file = createMockFile('test.txt', 1024, 'text/plain');
      const result = validateFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files over max size', () => {
      // Create a file larger than 10MB
      const largeContent = 'x'.repeat(11 * 1024 * 1024);
      const file = createMockFile('large.txt', 11 * 1024 * 1024, 'text/plain', largeContent);
      
      // Manually set size for the test since Blob size might differ
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
      
      const result = validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
      expect(result.error).toContain('10 MB');
    });

    it('should accept files exactly at max size', () => {
      const file = createMockFile('exact.txt', ATTACHMENT_CONFIG.maxFileSize, 'text/plain');
      Object.defineProperty(file, 'size', { value: ATTACHMENT_CONFIG.maxFileSize });
      
      const result = validateFile(file);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('fileToBase64', () => {
    it('should convert file to base64 string', async () => {
      const file = createMockFile('test.txt', 100, 'text/plain');
      
      const result = await fileToBase64(file);
      
      expect(result).toBe('mockBase64Data'); // Without the data URL prefix
    });
  });

  describe('getDataUrl', () => {
    it('should create correct data URL', () => {
      const base64 = 'SGVsbG8gV29ybGQ=';
      const mimeType = 'text/plain';
      
      const result = getDataUrl(base64, mimeType);
      
      expect(result).toBe('data:text/plain;base64,SGVsbG8gV29ybGQ=');
    });

    it('should handle different MIME types', () => {
      expect(getDataUrl('abc', 'image/png')).toBe('data:image/png;base64,abc');
      expect(getDataUrl('xyz', 'application/pdf')).toBe('data:application/pdf;base64,xyz');
    });
  });

  describe('createAttachment', () => {
    it('should create attachment object with correct properties', async () => {
      const file = createMockFile('test.txt', 100, 'text/plain');
      Object.defineProperty(file, 'size', { value: 100 });
      
      const attachment = await createAttachment(file);
      
      expect(attachment).toHaveProperty('id');
      expect(attachment.name).toBe('test.txt');
      expect(attachment.type).toBe('text/plain');
      expect(attachment.size).toBe(100);
      expect(attachment.data).toBe('mockBase64Data');
      expect(attachment.createdAt).toBeDefined();
      expect(typeof attachment.createdAt).toBe('number');
    });

    it('should generate unique IDs', async () => {
      const file1 = createMockFile('test1.txt', 100, 'text/plain');
      const file2 = createMockFile('test2.txt', 100, 'text/plain');
      
      const attachment1 = await createAttachment(file1);
      const attachment2 = await createAttachment(file2);
      
      expect(attachment1.id).not.toBe(attachment2.id);
    });

    it('should set default MIME type for files without type', async () => {
      const file = createMockFile('unknown', 100, '');
      
      const attachment = await createAttachment(file);
      
      expect(attachment.type).toBe('application/octet-stream');
    });
  });
});

import { v4 as uuidv4 } from 'uuid';
import { Attachment, ATTACHMENT_CONFIG, isImageType } from '../types';

/**
 * Reads a file and converts it to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a thumbnail for an image file
 */
export async function createThumbnail(file: File): Promise<string | undefined> {
  if (!isImageType(file.type)) {
    return undefined;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { maxThumbnailSize, thumbnailQuality } = ATTACHMENT_CONFIG;
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxThumbnailSize) {
          height = Math.round((height * maxThumbnailSize) / width);
          width = maxThumbnailSize;
        }
      } else {
        if (height > maxThumbnailSize) {
          width = Math.round((width * maxThumbnailSize) / height);
          height = maxThumbnailSize;
        }
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(undefined);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 (JPEG for smaller size)
      const dataUrl = canvas.toDataURL('image/jpeg', thumbnailQuality);
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };

    img.src = url;
  });
}

/**
 * Validates a file for upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const { maxFileSize } = ATTACHMENT_CONFIG;
  
  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxFileSize / 1024 / 1024} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Creates an Attachment object from a File
 */
export async function createAttachment(file: File): Promise<Attachment> {
  const [data, thumbnail] = await Promise.all([
    fileToBase64(file),
    createThumbnail(file),
  ]);

  return {
    id: uuidv4(),
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    data,
    thumbnail,
    createdAt: Date.now(),
  };
}

/**
 * Gets a data URL from base64 data
 */
export function getDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Downloads an attachment
 */
export function downloadAttachment(attachment: Attachment): void {
  const dataUrl = getDataUrl(attachment.data, attachment.type);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Gets clipboard image (for paste support)
 */
export async function getClipboardImage(clipboardData: DataTransfer): Promise<File | null> {
  const items = clipboardData.items;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        // Generate a filename for pasted images
        const extension = item.type.split('/')[1] || 'png';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newFile = new File([file], `pasted-image-${timestamp}.${extension}`, {
          type: file.type,
        });
        return newFile;
      }
    }
  }
  
  return null;
}

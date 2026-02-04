import React, { useCallback, useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { ATTACHMENT_CONFIG, formatFileSize } from '../types';
import { validateFile, createAttachment, getClipboardImage } from '../lib/attachments';
import type { Attachment } from '../types';

interface AttachmentUploadProps {
  onUpload: (attachment: Attachment) => Promise<void>;
  disabled?: boolean;
}

export function AttachmentUpload({ onUpload, disabled = false }: AttachmentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        continue;
      }

      setIsUploading(true);
      try {
        const attachment = await createAttachment(file);
        await onUpload(attachment);
      } catch (err) {
        setError('Failed to upload file');
        console.error('Upload error:', err);
      } finally {
        setIsUploading(false);
      }
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  // Handle paste events
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    if (disabled) return;
    
    const file = await getClipboardImage(e.clipboardData);
    if (file) {
      e.preventDefault();
      handleFiles([file]);
    }
  }, [disabled, handleFiles]);

  return (
    <div className="space-y-2">
      <div
        ref={dropZoneRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        className={`
          relative flex flex-col items-center justify-center
          p-4 border-2 border-dashed rounded-lg
          transition-colors cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {formatFileSize(ATTACHMENT_CONFIG.maxFileSize)} per file • Ctrl+V to paste
            </p>
          </>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

import React from 'react';
import { Download, Trash2, ExternalLink } from 'lucide-react';
import { Attachment, isImageType, formatFileSize, getFileIcon } from '../types';
import { getDataUrl, downloadAttachment } from '../lib/attachments';
import { Button } from './ui/button';

interface AttachmentItemProps {
  attachment: Attachment;
  onDelete: (id: string) => void;
  onPreview: (attachment: Attachment) => void;
}

export function AttachmentItem({ attachment, onDelete, onPreview }: AttachmentItemProps) {
  const isImage = isImageType(attachment.type);
  const thumbnailUrl = attachment.thumbnail 
    ? getDataUrl(attachment.thumbnail, 'image/jpeg')
    : isImage 
      ? getDataUrl(attachment.data, attachment.type)
      : undefined;

  const handleClick = () => {
    if (isImage) {
      onPreview(attachment);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadAttachment(attachment);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(attachment.id);
  };

  return (
    <div 
      className={`
        group relative flex flex-col items-center p-2 
        border rounded-lg bg-muted/30 
        transition-colors hover:bg-muted/50
        ${isImage ? 'cursor-pointer' : ''}
      `}
      onClick={handleClick}
    >
      {/* Thumbnail or Icon */}
      <div className="relative w-20 h-20 flex items-center justify-center mb-1">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={attachment.name}
            className="max-w-full max-h-full object-contain rounded"
          />
        ) : (
          <span className="text-3xl">{getFileIcon(attachment.type)}</span>
        )}
        
        {/* Overlay on hover */}
        {isImage && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
            <ExternalLink className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Filename */}
      <p 
        className="text-xs text-center truncate w-full max-w-[96px]" 
        title={attachment.name}
      >
        {attachment.name}
      </p>
      
      {/* File size */}
      <p className="text-xs text-muted-foreground">
        {formatFileSize(attachment.size)}
      </p>

      {/* Action buttons */}
      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6"
          onClick={handleDownload}
          title="Download"
        >
          <Download className="h-3 w-3" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

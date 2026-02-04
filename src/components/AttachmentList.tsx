import React, { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { Attachment, isImageType } from '../types';
import { AttachmentItem } from './AttachmentItem';
import { AttachmentUpload } from './AttachmentUpload';
import { AttachmentLightbox } from './AttachmentLightbox';

interface AttachmentListProps {
  attachments: Attachment[];
  onAdd: (attachment: Attachment) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
  readOnly?: boolean;
}

export function AttachmentList({
  attachments,
  onAdd,
  onDelete,
  readOnly = false,
}: AttachmentListProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handlePreview = (attachment: Attachment) => {
    const index = attachments.findIndex(a => a.id === attachment.id);
    if (index !== -1 && isImageType(attachment.type)) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    await onDelete(attachmentId);
  };

  const imageCount = attachments.filter(a => isImageType(a.type)).length;
  const fileCount = attachments.length - imageCount;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">
          Attachments
          {attachments.length > 0 && (
            <span className="text-muted-foreground font-normal ml-1">
              ({imageCount > 0 && `${imageCount} image${imageCount !== 1 ? 's' : ''}`}
              {imageCount > 0 && fileCount > 0 && ', '}
              {fileCount > 0 && `${fileCount} file${fileCount !== 1 ? 's' : ''}`})
            </span>
          )}
        </h4>
      </div>

      {/* Attachments grid */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      {/* Upload zone */}
      {!readOnly && (
        <AttachmentUpload onUpload={onAdd} />
      )}

      {/* Empty state */}
      {attachments.length === 0 && readOnly && (
        <p className="text-sm text-muted-foreground italic">
          No attachments
        </p>
      )}

      {/* Lightbox */}
      <AttachmentLightbox
        attachments={attachments}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}

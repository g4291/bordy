import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Attachment, isImageType, formatFileSize } from '../types';
import { getDataUrl, downloadAttachment } from '../lib/attachments';
import { Button } from './ui/button';

interface AttachmentLightboxProps {
  attachments: Attachment[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function AttachmentLightbox({
  attachments,
  currentIndex,
  open,
  onClose,
  onNavigate,
}: AttachmentLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter only images for gallery navigation
  const imageAttachments = attachments.filter(a => isImageType(a.type));
  const currentImageIndex = imageAttachments.findIndex(
    a => a.id === attachments[currentIndex]?.id
  );
  const currentAttachment = attachments[currentIndex];

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    if (currentImageIndex > 0) {
      const prevImage = imageAttachments[currentImageIndex - 1];
      const newIndex = attachments.findIndex(a => a.id === prevImage.id);
      onNavigate(newIndex);
    }
  }, [currentImageIndex, imageAttachments, attachments, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentImageIndex < imageAttachments.length - 1) {
      const nextImage = imageAttachments[currentImageIndex + 1];
      const newIndex = attachments.findIndex(a => a.id === nextImage.id);
      onNavigate(newIndex);
    }
  }, [currentImageIndex, imageAttachments, attachments, onNavigate]);

  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(z * 1.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => {
      const newZoom = Math.max(z / 1.5, 0.5);
      if (newZoom <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
      }
    };

    // Use capture phase to intercept Escape before Radix Dialog handles it
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [open, handlePrevious, handleNext, onClose, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z * 1.1, 5));
    } else {
      setZoom(z => {
        const newZoom = Math.max(z / 1.1, 0.5);
        if (newZoom <= 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newZoom;
      });
    }
  };

  if (!open || !currentAttachment) return null;

  const imageUrl = getDataUrl(currentAttachment.data, currentAttachment.type);
  const hasPrevious = currentImageIndex > 0;
  const hasNext = currentImageIndex < imageAttachments.length - 1;

  const lightboxContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 text-white"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <span className="font-medium">{currentAttachment.name}</span>
          <span className="text-sm text-white/60">
            {formatFileSize(currentAttachment.size)}
          </span>
          {imageAttachments.length > 1 && (
            <span className="text-sm text-white/60">
              {currentImageIndex + 1} / {imageAttachments.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleZoomOut}
            title="Zoom out (-)"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-sm min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleZoomIn}
            title="Zoom in (+)"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => downloadAttachment(currentAttachment)}
            title="Download"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Image container */}
      <div 
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onClick={e => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={imageUrl}
          alt={currentAttachment.name}
          className="max-w-[95vw] max-h-[80vh] object-contain select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          draggable={false}
        />

        {/* Navigation arrows */}
        {hasPrevious && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 text-white hover:bg-white/20 bg-black/30"
            onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
            title="Previous (←)"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 text-white hover:bg-white/20 bg-black/30"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            title="Next (→)"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>

      {/* Thumbnails strip */}
      {imageAttachments.length > 1 && (
        <div 
          className="flex justify-center gap-2 p-4 bg-black/50"
          onClick={e => e.stopPropagation()}
        >
          {imageAttachments.map((attachment, idx) => {
            const thumbUrl = attachment.thumbnail
              ? getDataUrl(attachment.thumbnail, 'image/jpeg')
              : getDataUrl(attachment.data, attachment.type);
            const isActive = idx === currentImageIndex;
            
            return (
              <button
                key={attachment.id}
                onClick={() => {
                  const newIndex = attachments.findIndex(a => a.id === attachment.id);
                  onNavigate(newIndex);
                }}
                className={`
                  w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${isActive 
                    ? 'border-white scale-110 shadow-lg shadow-white/20' 
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/40'
                  }
                `}
              >
                <img
                  src={thumbUrl}
                  alt={attachment.name}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Keyboard hints */}
      <div className="absolute bottom-4 left-4 text-white/40 text-xs">
        ← → Navigate • +/- Zoom • 0 Reset • Esc Close
      </div>
    </div>
  );

  // Use portal to render outside of dialog
  return createPortal(lightboxContent, document.body);
}

import React from 'react';
import { Label } from '../types';

interface LabelBadgeProps {
  label: Label;
  size?: 'sm' | 'md';
  showName?: boolean;
  onClick?: () => void;
}

export function LabelBadge({ label, size = 'sm', showName = true, onClick }: LabelBadgeProps) {
  const sizeClasses = {
    sm: 'h-5 text-[10px] px-1.5',
    md: 'h-6 text-xs px-2',
  };

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center justify-center rounded-sm font-medium
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${showName && label.name ? '' : 'min-w-[24px]'}
      `}
      style={{ backgroundColor: label.color, color: getContrastColor(label.color) }}
      title={label.name || undefined}
    >
      {showName && label.name ? (
        <span className="truncate max-w-[80px]">{label.name}</span>
      ) : null}
    </span>
  );
}

// Helper to determine if text should be white or black based on background
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

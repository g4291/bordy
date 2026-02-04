import React from 'react';
import { Check } from 'lucide-react';
import { COLUMN_COLORS } from '../types';
import { cn } from '../lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label = 'Color' }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {COLUMN_COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
              'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
              value === color.value
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-transparent',
              !color.value && 'bg-muted border-dashed border-muted-foreground/50'
            )}
            style={{ backgroundColor: color.value || undefined }}
            title={color.name}
          >
            {value === color.value && (
              <Check
                className={cn(
                  'h-4 w-4',
                  color.value && isLightColor(color.value)
                    ? 'text-gray-800'
                    : color.value
                    ? 'text-white'
                    : 'text-muted-foreground'
                )}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper to determine if a color is light (for contrast)
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

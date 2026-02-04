import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { BoardTemplate } from '../types';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface TemplateCardProps {
  template: BoardTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

export function TemplateCard({ template, isSelected, onSelect, onDelete }: TemplateCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50',
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Delete button for custom templates */}
      {!template.isBuiltIn && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-0 hover:opacity-100 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}

      {/* Icon */}
      <div className="text-3xl mb-2">{template.icon}</div>

      {/* Name */}
      <h3 className="font-medium text-sm mb-1">{template.name}</h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {template.description}
      </p>

      {/* Stats */}
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span>{template.columns.length} columns</span>
        <span>•</span>
        <span>{template.labels.length} labels</span>
        {template.tasks.length > 0 && (
          <>
            <span>•</span>
            <span>{template.tasks.length} tasks</span>
          </>
        )}
      </div>

      {/* Custom badge */}
      {!template.isBuiltIn && (
        <span className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
          Custom
        </span>
      )}
    </div>
  );
}

import React from 'react';
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from 'lucide-react';
import { TaskPriority, PRIORITY_CONFIG } from '../types';
import { cn } from '../lib/utils';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const priorityIcons = {
  none: null,
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  critical: AlertTriangle,
};

export function PriorityBadge({ 
  priority, 
  size = 'sm', 
  showLabel = true,
  className 
}: PriorityBadgeProps) {
  if (priority === 'none') return null;

  const config = PRIORITY_CONFIG[priority];
  const Icon = priorityIcons[priority];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium',
        config.bgClass,
        config.textClass,
        sizeClasses[size],
        className
      )}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

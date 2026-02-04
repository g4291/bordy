import React from 'react';
import { ArrowDown, Minus, ArrowUp, AlertTriangle, Flag, Check } from 'lucide-react';
import { TaskPriority, PRIORITY_CONFIG } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface PrioritySelectProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  className?: string;
}

const priorityIcons = {
  none: Flag,
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  critical: AlertTriangle,
};

const priorities: TaskPriority[] = ['none', 'low', 'medium', 'high', 'critical'];

export function PrioritySelect({ value, onChange, className }: PrioritySelectProps) {
  const currentConfig = PRIORITY_CONFIG[value];
  const CurrentIcon = priorityIcons[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start gap-2', className)}
        >
          <CurrentIcon 
            className="h-4 w-4" 
            style={{ color: value !== 'none' ? currentConfig.color : undefined }}
          />
          <span>{currentConfig.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {priorities.map((priority) => {
          const config = PRIORITY_CONFIG[priority];
          const Icon = priorityIcons[priority];
          const isSelected = value === priority;

          return (
            <button
              key={priority}
              onClick={() => onChange(priority)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors',
                isSelected ? 'bg-accent' : 'hover:bg-accent/50'
              )}
            >
              <Icon 
                className="h-4 w-4" 
                style={{ color: priority !== 'none' ? config.color : undefined }}
              />
              <span className="flex-1 text-left">{config.label}</span>
              {isSelected && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for inline use
interface PriorityIconButtonProps {
  priority: TaskPriority;
  onClick?: () => void;
  className?: string;
}

export function PriorityIconButton({ priority, onClick, className }: PriorityIconButtonProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = priorityIcons[priority];

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-1 rounded hover:bg-accent transition-colors',
        className
      )}
      title={`Priority: ${config.label}`}
    >
      <Icon 
        className="h-4 w-4" 
        style={{ color: priority !== 'none' ? config.color : undefined }}
      />
    </button>
  );
}

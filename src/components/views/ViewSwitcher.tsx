import React from 'react';
import { LayoutDashboard, Calendar, ListTodo } from 'lucide-react';
import { ViewMode } from '../../types';
import { Button } from '../ui/button';

interface ViewSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: React.ElementType; shortcut: string }[] = [
  { mode: 'kanban', label: 'Kanban', icon: LayoutDashboard, shortcut: '' },
  { mode: 'calendar', label: 'Calendar', icon: Calendar, shortcut: '' },
  { mode: 'agenda', label: 'Agenda', icon: ListTodo, shortcut: '' },
];

export function ViewSwitcher({ viewMode, onViewModeChange, className = '' }: ViewSwitcherProps) {
  return (
    <div className={`inline-flex items-center rounded-lg border bg-muted p-1 ${className}`}>
      {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
        <Button
          key={mode}
          variant={viewMode === mode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange(mode)}
          className={`
            px-3 py-1.5 h-8 gap-1.5 text-sm font-medium transition-all
            ${viewMode === mode 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            }
          `}
          title={`Switch to ${label} view`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}

/**
 * Compact version for mobile or tight spaces
 */
export function ViewSwitcherCompact({ viewMode, onViewModeChange, className = '' }: ViewSwitcherProps) {
  return (
    <div className={`inline-flex items-center rounded-md border bg-muted p-0.5 ${className}`}>
      {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
        <Button
          key={mode}
          variant={viewMode === mode ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewModeChange(mode)}
          className={`
            h-7 w-7 transition-all
            ${viewMode === mode 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            }
          `}
          title={`${label} view`}
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </div>
  );
}

/**
 * Hook to cycle through view modes (for keyboard shortcut)
 */
export function getNextViewMode(current: ViewMode): ViewMode {
  const modes: ViewMode[] = ['kanban', 'calendar', 'agenda'];
  const currentIndex = modes.indexOf(current);
  const nextIndex = (currentIndex + 1) % modes.length;
  return modes[nextIndex];
}

import React from 'react';
import { X, Search, Calendar, ArrowDown, Minus, ArrowUp, AlertTriangle, Flag, CheckCircle2, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { Label, TaskPriority, PRIORITY_CONFIG } from '../types';
import { TaskFilters, DueDateFilter, CompletionFilter } from '../hooks/useTaskFilter';

interface ActiveFiltersProps {
  filters: TaskFilters;
  labels: Label[];
  onClearSearch: () => void;
  onRemoveLabelFilter: (labelId: string) => void;
  onClearDueDateFilter: () => void;
  onRemovePriorityFilter: (priority: TaskPriority) => void;
  onClearCompletionFilter: () => void;
  onClearAll: () => void;
  filteredCount?: number;
  totalCount?: number;
}

const dueDateLabels: Record<DueDateFilter, string> = {
  all: 'All dates',
  overdue: 'Overdue',
  today: 'Today',
  'this-week': 'This week',
  'no-date': 'No date',
};

const completionLabels: Record<CompletionFilter, string> = {
  all: 'All tasks',
  incomplete: 'Incomplete',
  completed: 'Completed',
};

const priorityIcons = {
  none: Flag,
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  critical: AlertTriangle,
};

export function ActiveFilters({
  filters,
  labels,
  onClearSearch,
  onRemoveLabelFilter,
  onClearDueDateFilter,
  onRemovePriorityFilter,
  onClearCompletionFilter,
  onClearAll,
  filteredCount,
  totalCount,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.labelIds.length > 0 ||
    filters.dueDateFilter !== 'all' ||
    filters.priorities.length > 0 ||
    filters.completionFilter !== 'all';

  if (!hasActiveFilters) {
    return null;
  }

  const selectedLabels = labels.filter((l) => filters.labelIds.includes(l.id));
  const showStats = filteredCount !== undefined && totalCount !== undefined && totalCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-muted/50 border-b">
      <span className="text-xs text-muted-foreground font-medium">Filters:</span>

      {/* Search query badge */}
      {filters.searchQuery && (
        <FilterBadge
          icon={<Search className="h-3 w-3" />}
          label={`"${filters.searchQuery}"`}
          onRemove={onClearSearch}
        />
      )}

      {/* Completion filter badge */}
      {filters.completionFilter !== 'all' && (
        <FilterBadge
          icon={
            filters.completionFilter === 'completed' 
              ? <CheckCircle2 className="h-3 w-3 text-green-500" />
              : <Circle className="h-3 w-3" />
          }
          label={completionLabels[filters.completionFilter]}
          onRemove={onClearCompletionFilter}
          variant={filters.completionFilter === 'completed' ? 'success' : 'default'}
        />
      )}

      {/* Priority badges */}
      {filters.priorities.map((priority) => {
        const config = PRIORITY_CONFIG[priority];
        const Icon = priorityIcons[priority];
        return (
          <FilterBadge
            key={priority}
            icon={
              <Icon 
                className="h-3 w-3" 
                style={{ color: priority !== 'none' ? config.color : undefined }}
              />
            }
            label={config.label}
            onRemove={() => onRemovePriorityFilter(priority)}
            variant={priority === 'critical' ? 'destructive' : priority === 'high' ? 'warning' : 'default'}
          />
        );
      })}

      {/* Due date badge */}
      {filters.dueDateFilter !== 'all' && (
        <FilterBadge
          icon={<Calendar className="h-3 w-3" />}
          label={dueDateLabels[filters.dueDateFilter]}
          onRemove={onClearDueDateFilter}
          variant={filters.dueDateFilter === 'overdue' ? 'destructive' : 'default'}
        />
      )}

      {/* Label badges */}
      {selectedLabels.map((label) => (
        <FilterBadge
          key={label.id}
          icon={
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: label.color }}
            />
          }
          label={label.name}
          onRemove={() => onRemoveLabelFilter(label.id)}
        />
      ))}

      {/* Clear all button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={onClearAll}
      >
        Clear all
      </Button>

      {/* Stats - pushed to the right */}
      {showStats && (
        <span className="ml-auto text-xs text-muted-foreground">
          Showing {filteredCount} of {totalCount} tasks
        </span>
      )}
    </div>
  );
}

interface FilterBadgeProps {
  icon: React.ReactNode;
  label: string;
  onRemove: () => void;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

function FilterBadge({ icon, label, onRemove, variant = 'default' }: FilterBadgeProps) {
  const variantStyles = {
    default: 'bg-background border-border hover:bg-accent',
    destructive: 'bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400',
    warning: 'bg-orange-100 dark:bg-orange-500/20 border-orange-300 dark:border-orange-500/30 text-orange-700 dark:text-orange-400',
    success: 'bg-green-100 dark:bg-green-500/20 border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 text-xs rounded-full border ${variantStyles[variant]}`}
    >
      {icon}
      <span className="max-w-24 truncate">{label}</span>
      <button
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-muted-foreground/20 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

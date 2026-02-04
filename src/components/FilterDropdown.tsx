import React from 'react';
import { Filter, Calendar, Tag, Check, Flag, ArrowDown, Minus, ArrowUp, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Label, TaskPriority, PRIORITY_CONFIG } from '../types';
import { DueDateFilter, CompletionFilter } from '../hooks/useTaskFilter';

interface FilterDropdownProps {
  labels: Label[];
  selectedLabelIds: string[];
  dueDateFilter: DueDateFilter;
  selectedPriorities: TaskPriority[];
  completionFilter: CompletionFilter;
  onToggleLabelFilter: (labelId: string) => void;
  onDueDateFilterChange: (filter: DueDateFilter) => void;
  onTogglePriorityFilter: (priority: TaskPriority) => void;
  onCompletionFilterChange: (filter: CompletionFilter) => void;
  activeFilterCount: number;
}

const dueDateOptions: { value: DueDateFilter; label: string; description?: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'overdue', label: 'Overdue', description: 'Past due date' },
  { value: 'today', label: 'Today', description: 'Due today' },
  { value: 'this-week', label: 'This week', description: 'Due this week' },
  { value: 'no-date', label: 'No date', description: 'Without due date' },
];

const completionOptions: { value: CompletionFilter; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All tasks', icon: Circle },
  { value: 'incomplete', label: 'Incomplete', icon: Circle },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const priorityIcons = {
  none: Flag,
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  critical: AlertTriangle,
};

const priorities: TaskPriority[] = ['critical', 'high', 'medium', 'low', 'none'];

export function FilterDropdown({
  labels,
  selectedLabelIds,
  dueDateFilter,
  selectedPriorities,
  completionFilter,
  onToggleLabelFilter,
  onDueDateFilterChange,
  onTogglePriorityFilter,
  onCompletionFilterChange,
  activeFilterCount,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center h-5 w-5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Completion Status Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Status
        </DropdownMenuLabel>
        <div className="px-2 pb-2">
          {completionOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = completionFilter === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onCompletionFilterChange(option.value)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                  isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                }`}
              >
                <Icon 
                  className={`h-4 w-4 flex-shrink-0 ${
                    option.value === 'completed' ? 'text-green-500' : ''
                  }`}
                />
                <span className="flex-1 text-left">{option.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Priority Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Flag className="h-4 w-4" />
          Priority
        </DropdownMenuLabel>
        <div className="px-2 pb-2">
          {priorities.map((priority) => {
            const config = PRIORITY_CONFIG[priority];
            const Icon = priorityIcons[priority];
            const isSelected = selectedPriorities.includes(priority);

            return (
              <button
                key={priority}
                onClick={() => onTogglePriorityFilter(priority)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                  isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                }`}
              >
                <Icon 
                  className="h-4 w-4 flex-shrink-0" 
                  style={{ color: priority !== 'none' ? config.color : undefined }}
                />
                <span className="flex-1 text-left">{config.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Due Date Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Due Date
        </DropdownMenuLabel>
        <div className="px-2 pb-2">
          {dueDateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onDueDateFilterChange(option.value)}
              className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
                dueDateFilter === option.value
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-accent'
              }`}
            >
              <span>{option.label}</span>
              {dueDateFilter === option.value && (
                <Check className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* Labels Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Labels
        </DropdownMenuLabel>
        <div className="px-2 pb-2 max-h-48 overflow-y-auto">
          {labels.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 px-2">
              No labels on this board
            </p>
          ) : (
            labels.map((label) => {
              const isSelected = selectedLabelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  onClick={() => onToggleLabelFilter(label.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                  }`}
                >
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 text-left truncate">{label.name}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task, Label, PRIORITY_CONFIG } from '../../types';

interface CalendarTaskItemProps {
  task: Task;
  labels: Label[];
  onClick: (task: Task) => void;
  compact?: boolean;  // For month view (less details)
}

export function CalendarTaskItem({ 
  task, 
  labels, 
  onClick,
  compact = false 
}: CalendarTaskItemProps) {
  const priority = task.priority || 'none';
  const priorityConfig = PRIORITY_CONFIG[priority];
  const isCompleted = task.completed;
  
  // Get first label color for indicator
  const taskLabels = labels.filter(l => task.labelIds?.includes(l.id));
  const firstLabelColor = taskLabels[0]?.color;

  // Subtask progress
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const hasSubtasks = subtasks.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(task);
  };

  if (compact) {
    // Compact view for month calendar - just colored dot and truncated title
    return (
      <button
        onClick={handleClick}
        className={`
          w-full text-left px-1.5 py-0.5 rounded text-xs truncate
          hover:bg-accent transition-colors cursor-pointer
          flex items-center gap-1
          ${isCompleted ? 'opacity-60' : ''}
          ${priority !== 'none' && !isCompleted ? priorityConfig.bgClass : 'bg-muted/50'}
        `}
        title={task.title}
      >
        {/* Completed indicator */}
        {isCompleted ? (
          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
        ) : (
          /* Priority/Label indicator */
          <span 
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ 
              backgroundColor: priority !== 'none' 
                ? priorityConfig.color 
                : firstLabelColor || '#6b7280' 
            }}
          />
        )}
        <span className={`truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </span>
        {hasSubtasks && (
          <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">
            {completedSubtasks}/{subtasks.length}
          </span>
        )}
      </button>
    );
  }

  // Expanded view for week calendar - more details
  return (
    <button
      onClick={handleClick}
      className={`
        w-full text-left p-2 rounded-md border text-sm
        hover:bg-accent transition-colors cursor-pointer
        ${isCompleted ? 'opacity-60' : ''}
        ${priority !== 'none' && !isCompleted ? `${priorityConfig.borderClass} border-l-4` : ''}
      `}
    >
      <div className="flex items-start gap-2">
        {/* Completed indicator or Priority indicator */}
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
        ) : priority !== 'none' ? (
          <span 
            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style={{ backgroundColor: priorityConfig.color }}
          />
        ) : null}
        
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className={`font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </p>
          
          {/* Labels */}
          {taskLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {taskLabels.slice(0, 2).map(label => (
                <span
                  key={label.id}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${isCompleted ? 'opacity-60' : ''}`}
                  style={{ 
                    backgroundColor: `${label.color}20`, 
                    color: label.color 
                  }}
                >
                  {label.name}
                </span>
              ))}
              {taskLabels.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{taskLabels.length - 2}
                </span>
              )}
            </div>
          )}
          
          {/* Subtask progress */}
          {hasSubtasks && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                  style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {completedSubtasks}/{subtasks.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Draggable wrapper for CalendarTaskItem
 */
interface DraggableCalendarTaskItemProps extends CalendarTaskItemProps {}

export function DraggableCalendarTaskItem(props: DraggableCalendarTaskItemProps) {
  const { task } = props;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      <CalendarTaskItem {...props} />
    </div>
  );
}

/**
 * "More tasks" indicator for month view
 */
interface MoreTasksIndicatorProps {
  count: number;
  onClick: () => void;
}

export function MoreTasksIndicator({ count, onClick }: MoreTasksIndicatorProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="
        w-full text-left px-1.5 py-0.5 rounded text-xs
        text-muted-foreground hover:text-foreground hover:bg-accent
        transition-colors cursor-pointer
      "
    >
      +{count} more
    </button>
  );
}

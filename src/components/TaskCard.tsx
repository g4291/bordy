import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, AlertTriangle, Calendar, Clock, Paperclip, Check, GripVertical } from 'lucide-react';
import { Task, Label, Comment, Attachment, PRIORITY_CONFIG } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LabelBadge } from './LabelBadge';
import { SubtaskProgress } from './SubtaskProgress';
import { PriorityBadge } from './PriorityBadge';
import { TaskDetailDialog } from './views/TaskDetailDialog';

interface TaskCardProps {
  task: Task;
  labels: Label[];
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds' | 'dueDate' | 'subtasks' | 'priority' | 'completed' | 'completedAt'>>) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => Promise<any>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onUpdateSubtask: (taskId: string, subtaskId: string, title: string) => Promise<void>;
  // Comment handlers
  onAddComment: (taskId: string, text: string) => Promise<Comment | undefined>;
  onUpdateComment: (taskId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment: (taskId: string, commentId: string) => Promise<void>;
  // Attachment handlers
  onAddAttachment: (taskId: string, attachment: Attachment) => Promise<void>;
  onDeleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  // Completion handler
  onToggleComplete?: (taskId: string) => void;
}

export function TaskCard({ 
  task, 
  labels, 
  onUpdate, 
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddAttachment,
  onDeleteAttachment,
  onToggleComplete,
}: TaskCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none', // Important for touch devices
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open detail if dragging, clicking on dropdown, or checkbox
    if (isDragging) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown]') || target.closest('[data-complete-checkbox]')) {
      return;
    }
    setIsDetailOpen(true);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(task.id);
    } else {
      // Fallback: update via onUpdate
      onUpdate(task.id, {
        completed: !task.completed,
        completedAt: !task.completed ? Date.now() : undefined,
      });
    }
  };

  // Helper function for due date status - don't show urgent status for completed tasks
  const getDueDateStatus = (dueDate?: number): 'overdue' | 'today' | 'tomorrow' | 'soon' | 'ok' | null => {
    if (!dueDate) return null;
    if (task.completed) return 'ok'; // Completed tasks don't show urgency
    
    const now = new Date();
    const due = new Date(dueDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffTime = dueDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays <= 3) return 'soon';
    return 'ok';
  };

  const formatDueDate = (dueDate: number, status: string): string => {
    if (task.completed) {
      // For completed tasks, just show the date
      const date = new Date(dueDate);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    if (status === 'overdue') {
      const now = new Date();
      const due = new Date(dueDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      const diffTime = today.getTime() - dueDay.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Overdue 1 day';
      return `Overdue ${diffDays} days`;
    }
    if (status === 'today') return 'Due today';
    if (status === 'tomorrow') return 'Due tomorrow';
    
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dueDateStatus = getDueDateStatus(task.dueDate);
  
  const dueDateStyles = {
    overdue: {
      badge: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 font-medium',
      icon: Clock,
    },
    today: {
      badge: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 font-medium',
      icon: AlertTriangle,
    },
    tomorrow: {
      badge: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20',
      icon: Calendar,
    },
    soon: {
      badge: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20',
      icon: Calendar,
    },
    ok: {
      badge: 'text-muted-foreground bg-muted',
      icon: Calendar,
    },
  };

  // Get labels for this task
  const taskLabels = labels.filter((l) => task.labelIds?.includes(l.id));

  // Get subtasks
  const subtasks = task.subtasks || [];

  // Get attachments count
  const attachmentCount = (task.attachments || []).length;

  // Get priority
  const priority = task.priority || 'none';
  const priorityConfig = PRIORITY_CONFIG[priority];

  // Card styling - completed tasks have muted appearance, no urgency border
  const cardClassName = `mb-2 cursor-pointer transition-colors ${
    task.completed 
      ? 'bg-muted/50 hover:bg-muted/70 opacity-75' 
      : 'bg-card hover:bg-accent/50'
  } ${
    task.completed ? '' : priorityConfig.borderClass
  } ${
    !task.completed && dueDateStatus === 'overdue' 
      ? 'border-t border-r border-b border-red-500 dark:border-red-500 shadow-sm shadow-red-500/20' 
      : !task.completed && dueDateStatus === 'today'
      ? 'border-t border-r border-b border-orange-400 dark:border-orange-500'
      : ''
  }`;

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`${cardClassName} cursor-grab active:cursor-grabbing`}
        onClick={handleCardClick}
        data-testid="task-card"
        data-task-id={task.id}
        data-completed={task.completed}
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3">
          {/* Labels row */}
          {taskLabels.length > 0 && (
            <div className={`flex flex-wrap gap-1 mb-2 ${task.completed ? 'opacity-60' : ''}`} data-testid="task-labels">
              {taskLabels.map((label) => (
                <LabelBadge key={label.id} label={label} size="sm" />
              ))}
            </div>
          )}

          <div className="flex items-start gap-2">
            {/* Complete checkbox */}
            <div 
              data-complete-checkbox
              className="mt-0.5 flex-shrink-0"
              onClick={handleToggleComplete}
            >
              <div
                className={`h-4 w-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-muted-foreground/50 hover:border-green-500 hover:bg-green-500/10'
                }`}
                data-testid="task-complete-checkbox"
              >
                {task.completed && <Check className="h-3 w-3" />}
              </div>
            </div>

            {/* Visual drag indicator */}
            <div className="mt-0.5 text-muted-foreground/50">
              <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p 
                className={`font-medium text-sm truncate ${
                  task.completed ? 'line-through text-muted-foreground' : ''
                }`} 
                data-testid="task-title"
              >
                {task.title}
              </p>
              {task.description && (
                <p 
                  className={`text-xs mt-1 line-clamp-2 ${
                    task.completed ? 'text-muted-foreground/60' : 'text-muted-foreground'
                  }`} 
                  data-testid="task-description"
                >
                  {task.description}
                </p>
              )}
              
              {/* Subtask Progress on card */}
              {subtasks.length > 0 && (
                <div className={`mt-2 ${task.completed ? 'opacity-60' : ''}`} data-testid="task-subtasks-progress">
                  <SubtaskProgress subtasks={subtasks} />
                </div>
              )}

              {/* Priority, Due Date, and Attachments badges */}
              <div className={`flex flex-wrap items-center gap-2 mt-2 ${task.completed ? 'opacity-60' : ''}`}>
                {priority !== 'none' && !task.completed && (
                  <span data-testid="task-priority">
                    <PriorityBadge priority={priority} size="sm" />
                  </span>
                )}
                {task.dueDate && dueDateStatus && (
                  <div 
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                      task.completed ? 'text-muted-foreground bg-muted' : dueDateStyles[dueDateStatus].badge
                    }`}
                    data-testid="task-due-date"
                    data-due-status={task.completed ? 'completed' : dueDateStatus}
                  >
                    {task.completed ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      React.createElement(dueDateStyles[dueDateStatus].icon, { className: 'h-3 w-3' })
                    )}
                    <span>{formatDueDate(task.dueDate, dueDateStatus)}</span>
                  </div>
                )}
                {attachmentCount > 0 && (
                  <div 
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded text-muted-foreground bg-muted"
                    data-testid="task-attachment-badge"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span>{attachmentCount}</span>
                  </div>
                )}
              </div>
            </div>
            <div data-dropdown data-testid="task-menu">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                    data-testid="task-menu-trigger"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(e);
                    }}
                    data-testid="task-menu-toggle-complete"
                  >
                    {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDetailOpen(true);
                    }}
                    data-testid="task-menu-view"
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                    }}
                    className="text-destructive"
                    data-testid="task-menu-delete"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shared Task Detail Dialog */}
      <TaskDetailDialog
        task={task}
        labels={labels}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddSubtask={onAddSubtask}
        onToggleSubtask={onToggleSubtask}
        onDeleteSubtask={onDeleteSubtask}
        onUpdateSubtask={onUpdateSubtask}
        onAddComment={onAddComment}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
        onAddAttachment={onAddAttachment}
        onDeleteAttachment={onDeleteAttachment}
        onToggleComplete={onToggleComplete}
      />
    </>
  );
}

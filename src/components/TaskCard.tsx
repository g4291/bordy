import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreVertical, AlertTriangle, Calendar, Clock, Paperclip } from 'lucide-react';
import { Task, Label, Comment, Attachment, PRIORITY_CONFIG } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
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
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds' | 'dueDate' | 'subtasks' | 'priority'>>) => void;
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open if clicking on drag handle or dropdown
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-handle]') || target.closest('[data-dropdown]')) {
      return;
    }
    setIsDetailOpen(true);
  };

  // Helper function for due date status
  const getDueDateStatus = (dueDate?: number): 'overdue' | 'today' | 'tomorrow' | 'soon' | 'ok' | null => {
    if (!dueDate) return null;
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

  // Card border style - priority border on left, overdue/today styling takes precedence for right border
  const cardClassName = `mb-2 cursor-pointer bg-card hover:bg-accent/50 transition-colors ${
    priorityConfig.borderClass
  } ${
    dueDateStatus === 'overdue' 
      ? 'border-t border-r border-b border-red-500 dark:border-red-500 shadow-sm shadow-red-500/20' 
      : dueDateStatus === 'today'
      ? 'border-t border-r border-b border-orange-400 dark:border-orange-500'
      : ''
  }`;

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cardClassName}
        onClick={handleCardClick}
      >
        <CardContent className="p-3">
          {/* Labels row */}
          {taskLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {taskLabels.map((label) => (
                <LabelBadge key={label.id} label={label} size="sm" />
              ))}
            </div>
          )}

          <div className="flex items-start gap-2">
            <button
              data-drag-handle
              {...attributes}
              {...listeners}
              className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{task.title}</p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              {/* Subtask Progress on card */}
              {subtasks.length > 0 && (
                <div className="mt-2">
                  <SubtaskProgress subtasks={subtasks} />
                </div>
              )}

              {/* Priority, Due Date, and Attachments badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {priority !== 'none' && (
                  <PriorityBadge priority={priority} size="sm" />
                )}
                {task.dueDate && dueDateStatus && (
                  <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${dueDateStyles[dueDateStatus].badge}`}>
                    {React.createElement(dueDateStyles[dueDateStatus].icon, { className: 'h-3 w-3' })}
                    <span>{formatDueDate(task.dueDate, dueDateStatus)}</span>
                  </div>
                )}
                {attachmentCount > 0 && (
                  <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded text-muted-foreground bg-muted">
                    <Paperclip className="h-3 w-3" />
                    <span>{attachmentCount}</span>
                  </div>
                )}
              </div>
            </div>
            <div data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailOpen(true);
                  }}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                    }}
                    className="text-destructive"
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
      />
    </>
  );
}

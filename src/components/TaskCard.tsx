import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, MoreVertical, AlertTriangle, Calendar, Clock, X } from 'lucide-react';
import { Task, Label, Subtask } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { LabelBadge } from './LabelBadge';
import { LabelPicker } from './LabelManager';
import { SubtaskProgress } from './SubtaskProgress';
import { SubtaskList } from './SubtaskList';

interface TaskCardProps {
  task: Task;
  labels: Label[];
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds' | 'dueDate' | 'subtasks'>>) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => Promise<any>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onUpdateSubtask: (taskId: string, subtaskId: string, title: string) => Promise<void>;
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
}: TaskCardProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editLabelIds, setEditLabelIds] = useState<string[]>(task.labelIds || []);
  const [editDueDate, setEditDueDate] = useState<string>(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );

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

  const handleOpenEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditLabelIds(task.labelIds || []);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setIsViewOpen(false);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        labelIds: editLabelIds,
        dueDate: editDueDate ? new Date(editDueDate).getTime() : undefined,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
    setIsDeleting(false);
  };

  const handleToggleLabel = (labelId: string) => {
    setEditLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open if clicking on drag handle or dropdown
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-handle]') || target.closest('[data-dropdown]')) {
      return;
    }
    setIsViewOpen(true);
  };

  // Helper functions for due date
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

  const formatFullDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  // Card border style for overdue
  const cardClassName = `mb-2 cursor-pointer bg-card hover:bg-accent/50 transition-colors ${
    dueDateStatus === 'overdue' 
      ? 'border-red-500 dark:border-red-500 border-2 shadow-sm shadow-red-500/20' 
      : dueDateStatus === 'today'
      ? 'border-orange-400 dark:border-orange-500'
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

              {task.dueDate && dueDateStatus && (
                <div className={`inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded ${dueDateStyles[dueDateStatus].badge}`}>
                  {React.createElement(dueDateStyles[dueDateStatus].icon, { className: 'h-3 w-3' })}
                  <span>{formatDueDate(task.dueDate, dueDateStatus)}</span>
                </div>
              )}
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
                  <DropdownMenuItem onClick={handleOpenEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleting(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Task Dialog (Quick view with checklist) */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Labels */}
            {taskLabels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {taskLabels.map((label) => (
                  <LabelBadge key={label.id} label={label} />
                ))}
              </div>
            )}

            {/* Due date */}
            {task.dueDate && dueDateStatus && (
              <div className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md ${dueDateStyles[dueDateStatus].badge}`}>
                {React.createElement(dueDateStyles[dueDateStatus].icon, { className: 'h-4 w-4' })}
                <span>{formatFullDate(task.dueDate)}</span>
              </div>
            )}

            {/* Description */}
            {task.description && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Description</h4>
                <p className="text-sm whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Checklist */}
            {subtasks.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Checklist</h4>
                  <SubtaskProgress subtasks={subtasks} showBar={false} />
                </div>
                <SubtaskProgress subtasks={subtasks} className="mb-3" />
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div 
                      key={subtask.id} 
                      className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => onToggleSubtask(task.id, subtask.id)}
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => onToggleSubtask(task.id, subtask.id)}
                        className="shrink-0"
                      />
                      <span className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for checklist */}
            {subtasks.length === 0 && !task.description && (
              <p className="text-sm text-muted-foreground italic">
                No description or checklist items yet.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleOpenEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Task description (optional)"
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Subtasks/Checklist section */}
            <div className="border rounded-lg p-3 bg-muted/30">
              <SubtaskList
                taskId={task.id}
                subtasks={subtasks}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onUpdateSubtask={onUpdateSubtask}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Labels</label>
              <LabelPicker
                labels={labels}
                selectedIds={editLabelIds}
                onToggle={handleToggleLabel}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Task
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "<strong>{task.title}</strong>"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

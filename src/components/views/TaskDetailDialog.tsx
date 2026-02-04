import React, { useState } from 'react';
import { Pencil, Trash2, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { Task, Label, TaskPriority, Comment, Attachment } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { LabelBadge } from '../LabelBadge';
import { LabelPicker } from '../LabelManager';
import { SubtaskProgress } from '../SubtaskProgress';
import { SubtaskList } from '../SubtaskList';
import { PriorityBadge } from '../PriorityBadge';
import { PrioritySelect } from '../PrioritySelect';
import { CommentList } from '../CommentList';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { MarkdownEditor } from '../MarkdownEditor';
import { AttachmentList } from '../AttachmentList';

interface TaskDetailDialogProps {
  task: Task | null;
  labels: Label[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds' | 'dueDate' | 'subtasks' | 'priority'>>) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => Promise<any>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onUpdateSubtask: (taskId: string, subtaskId: string, title: string) => Promise<void>;
  onAddComment: (taskId: string, text: string) => Promise<Comment | undefined>;
  onUpdateComment: (taskId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment: (taskId: string, commentId: string) => Promise<void>;
  onAddAttachment: (taskId: string, attachment: Attachment) => Promise<void>;
  onDeleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
}

export function TaskDetailDialog({
  task,
  labels,
  open,
  onOpenChange,
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
}: TaskDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLabelIds, setEditLabelIds] = useState<string[]>([]);
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('none');

  // Reset state when task changes
  React.useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditLabelIds(task.labelIds || []);
      setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setEditPriority(task.priority || 'none');
    }
    setIsEditing(false);
    setIsDeleting(false);
  }, [task]);

  if (!task) return null;

  const handleOpenEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditLabelIds(task.labelIds || []);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditPriority(task.priority || 'none');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        labelIds: editLabelIds,
        dueDate: editDueDate ? new Date(editDueDate).getTime() : undefined,
        priority: editPriority,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
    setIsDeleting(false);
    onOpenChange(false);
  };

  const handleToggleLabel = (labelId: string) => {
    setEditLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleAddAttachment = async (attachment: Attachment) => {
    await onAddAttachment(task.id, attachment);
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    await onDeleteAttachment(task.id, attachmentId);
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

  const formatFullDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const taskLabels = labels.filter((l) => task.labelIds?.includes(l.id));
  const subtasks = task.subtasks || [];
  const comments = task.comments || [];
  const attachments = task.attachments || [];
  const priority = task.priority || 'none';

  // View mode dialog
  if (!isEditing && !isDeleting) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Priority and Labels row */}
            <div className="flex flex-wrap items-center gap-2">
              {priority !== 'none' && (
                <PriorityBadge priority={priority} size="md" />
              )}
              {taskLabels.map((label) => (
                <LabelBadge key={label.id} label={label} />
              ))}
            </div>

            {/* Due date */}
            {task.dueDate && dueDateStatus && (
              <div
                className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md ${dueDateStyles[dueDateStatus].badge}`}
              >
                {React.createElement(dueDateStyles[dueDateStatus].icon, {
                  className: 'h-4 w-4',
                })}
                <span>{formatFullDate(task.dueDate)}</span>
              </div>
            )}

            {/* Description with Markdown */}
            {task.description && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  Description
                </h4>
                <div className="p-3 rounded-md bg-muted/30 border border-border">
                  <MarkdownRenderer content={task.description} />
                </div>
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
                      <span
                        className={`text-sm ${
                          subtask.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments section */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <AttachmentList
                attachments={attachments}
                onAdd={handleAddAttachment}
                onDelete={handleDeleteAttachment}
              />
            </div>

            {/* Comments section - always visible in view mode */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <CommentList
                taskId={task.id}
                comments={comments}
                onAddComment={onAddComment}
                onUpdateComment={onUpdateComment}
                onDeleteComment={onDeleteComment}
              />
            </div>

            {/* Empty state - only if no content at all */}
            {subtasks.length === 0 && !task.description && priority === 'none' && comments.length === 0 && attachments.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No description, checklist items, attachments, or comments yet.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleting(true)}
              className="text-destructive hover:text-destructive mr-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleOpenEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Delete confirmation
  if (isDeleting) {
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) setIsDeleting(false); onOpenChange(o); }}>
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
    );
  }

  // Edit mode dialog
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setIsEditing(false); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <label className="text-sm font-medium mb-2 block">Description</label>
            <MarkdownEditor
              value={editDescription}
              onChange={setEditDescription}
              placeholder="Task description (optional) - supports Markdown"
              minHeight="100px"
            />
          </div>

          {/* Priority section */}
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <PrioritySelect value={editPriority} onChange={setEditPriority} />
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

          {/* Attachments section in edit mode */}
          <div className="border rounded-lg p-3 bg-muted/30">
            <AttachmentList
              attachments={attachments}
              onAdd={handleAddAttachment}
              onDelete={handleDeleteAttachment}
            />
          </div>

          {/* Comments section in edit mode */}
          <div className="border rounded-lg p-3 bg-muted/30">
            <CommentList
              taskId={task.id}
              comments={comments}
              onAddComment={onAddComment}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
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
  );
}

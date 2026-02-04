import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus, MoreVertical, Pencil, Trash2, GripVertical, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Column, Task, Label, Comment, Attachment } from '../types';
import { TaskCard } from './TaskCard';
import { ColorPicker } from './ColorPicker';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  allTasksCount?: number;  // Total tasks in column (before filtering)
  labels: Label[];
  onUpdateColumn: (id: string, updates: { title?: string; color?: string; isCompleteColumn?: boolean }) => void;
  onDeleteColumn: (id: string) => void;
  onCreateTask: (columnId: string, title: string, description?: string, dueDate?: number) => void;
  onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds' | 'dueDate' | 'subtasks' | 'priority' | 'completed' | 'completedAt'>>) => void;
  onDeleteTask: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => Promise<any>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onUpdateSubtask: (taskId: string, subtaskId: string, title: string) => Promise<void>;
  hasActiveFilters?: boolean;
  // Comment handlers
  onAddComment: (taskId: string, text: string) => Promise<Comment | undefined>;
  onUpdateComment: (taskId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment: (taskId: string, commentId: string) => Promise<void>;
  // Attachment handlers
  onAddAttachment: (taskId: string, attachment: Attachment) => Promise<void>;
  onDeleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  // Completion handler
  onToggleTaskComplete?: (taskId: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  allTasksCount,
  labels,
  onUpdateColumn,
  onDeleteColumn,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
  hasActiveFilters = false,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddAttachment,
  onDeleteAttachment,
  onToggleTaskComplete,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editTitle, setEditTitle] = useState(column.title);
  const [editColor, setEditColor] = useState(column.color || '');
  const [editIsCompleteColumn, setEditIsCompleteColumn] = useState(column.isCompleteColumn || false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');

  // Sortable for the column itself (for reordering columns)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: column.id, 
    data: { type: 'column', column } 
  });

  // Droppable for receiving tasks (separate drop zone inside the column)
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `column-drop-${column.id}`,
    data: { type: 'column-drop', columnId: column.id }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleOpenEdit = () => {
    setEditTitle(column.title);
    setEditColor(column.color || '');
    setEditIsCompleteColumn(column.isCompleteColumn || false);
    setIsEditing(true);
  };

  const handleSaveColumn = () => {
    if (editTitle.trim()) {
      onUpdateColumn(column.id, { 
        title: editTitle.trim(), 
        color: editColor || undefined,
        isCompleteColumn: editIsCompleteColumn,
      });
      setIsEditing(false);
    }
  };

  const handleDeleteColumn = () => {
    onDeleteColumn(column.id);
    setIsDeleting(false);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(column.id, newTaskTitle.trim(), undefined, newTaskDueDate ? new Date(newTaskDueDate).getTime() : undefined);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setIsAddingTask(false);
    }
  };

  // Display count: show "filtered/total" when filtering, otherwise just count
  const displayCount = hasActiveFilters && allTasksCount !== undefined && allTasksCount !== tasks.length
    ? `${tasks.length}/${allTasksCount}`
    : tasks.length;

  if (isDragging) {
    // Render placeholder when dragging
    return (
      <Card
        ref={setSortableNodeRef}
        style={style}
        className="w-72 flex-shrink-0 bg-muted/30 border-dashed border-2 border-primary/50"
        data-testid="column"
        data-column-id={column.id}
      >
        <CardHeader className="p-3 pb-2">
          <div className="h-6" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="min-h-[200px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={setSortableNodeRef}
      style={{
        ...style,
        borderTopColor: column.color || undefined,
      }}
      className={`w-72 flex-shrink-0 bg-muted/50 flex flex-col h-full ${
        column.color ? 'border-t-4' : ''
      }`}
      data-testid="column"
      data-column-id={column.id}
      data-is-complete-column={column.isCompleteColumn || false}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground"
              data-testid="column-drag-handle"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {column.color && (
                <span 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: column.color }}
                />
              )}
              {column.isCompleteColumn && (
                <CheckCircle2 
                  className="h-4 w-4 text-green-500 flex-shrink-0" 
                  data-testid="column-complete-indicator"
                />
              )}
              <span data-testid="column-title">{column.title}</span>
              <span 
                className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                data-testid="column-task-count"
              >
                {displayCount}
              </span>
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                data-testid="column-menu-trigger"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenEdit} data-testid="column-menu-edit">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleting(true)}
                className="text-destructive"
                data-testid="column-menu-delete"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-1 flex flex-col min-h-0">
        <div
          ref={setDroppableNodeRef}
          className={`min-h-[100px] flex-1 overflow-y-auto space-y-2 rounded-lg transition-colors ${isOver ? 'bg-primary/10' : ''}`}
          data-testid="column-drop-zone"
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                labels={labels}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onUpdateSubtask={onUpdateSubtask}
                onAddComment={onAddComment}
                onUpdateComment={onUpdateComment}
                onDeleteComment={onDeleteComment}
                onAddAttachment={onAddAttachment}
                onDeleteAttachment={onDeleteAttachment}
                onToggleComplete={onToggleTaskComplete}
              />
            ))}
          </SortableContext>
          
          {tasks.length === 0 && (
            <div 
              className="h-[100px] flex items-center justify-center text-muted-foreground text-sm"
              data-testid="column-empty-state"
            >
              {hasActiveFilters ? 'No matching tasks' : 'Drop tasks here'}
            </div>
          )}
        </div>

        {isAddingTask ? (
          <div className="mt-2 space-y-2" data-testid="add-task-form">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') setIsAddingTask(false);
              }}
              data-testid="add-task-title-input"
            />
            <Input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              placeholder="Due date (optional)"
              className="text-sm"
              data-testid="add-task-date-input"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask} data-testid="add-task-submit">
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAddingTask(false)} data-testid="add-task-cancel">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 justify-start text-muted-foreground"
            onClick={() => setIsAddingTask(true)}
            data-testid="add-task-button"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add task
          </Button>
        )}
      </CardContent>

      {/* Edit Column Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent data-testid="edit-column-dialog">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Column title"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveColumn();
                }}
                data-testid="edit-column-title-input"
              />
            </div>
            <ColorPicker
              value={editColor}
              onChange={setEditColor}
              label="Column Color"
            />
            
            {/* Complete Column toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Done Column
                </label>
                <p className="text-xs text-muted-foreground">
                  Tasks moved here will be automatically marked as complete
                </p>
              </div>
              <Switch
                checked={editIsCompleteColumn}
                onCheckedChange={setEditIsCompleteColumn}
                data-testid="edit-column-complete-toggle"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveColumn} data-testid="edit-column-save">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Column Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent data-testid="delete-column-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Column
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "<strong>{column.title}</strong>"? 
              {tasks.length > 0 && (
                <> This will also delete <strong>{tasks.length} task{tasks.length > 1 ? 's' : ''}</strong> in this column.</>
              )}
              {' '}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteColumn} data-testid="delete-column-confirm">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

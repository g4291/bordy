import { useState, KeyboardEvent } from 'react';
import { Subtask } from '../types';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, Plus, CheckSquare } from 'lucide-react';
import { SubtaskProgress } from './SubtaskProgress';

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
  onAddSubtask: (taskId: string, title: string) => Promise<any>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onUpdateSubtask: (taskId: string, subtaskId: string, title: string) => Promise<void>;
}

export function SubtaskList({
  taskId,
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
}: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    await onAddSubtask(taskId, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    } else if (e.key === 'Escape') {
      setNewSubtaskTitle('');
    }
  };

  const handleStartEdit = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const handleSaveEdit = async (subtaskId: string) => {
    if (editingTitle.trim()) {
      await onUpdateSubtask(taskId, subtaskId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, subtaskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(subtaskId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingTitle('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckSquare className="h-4 w-4" />
          <span>Checklist</span>
        </div>
        {subtasks.length > 0 && (
          <SubtaskProgress subtasks={subtasks} showBar={false} />
        )}
      </div>

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <SubtaskProgress subtasks={subtasks} className="mb-2" />
      )}

      {/* Subtask items */}
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 group py-1 px-2 -mx-2 rounded hover:bg-muted/50"
          >
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => onToggleSubtask(taskId, subtask.id)}
              className="shrink-0"
            />
            
            {editingId === subtask.id ? (
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleSaveEdit(subtask.id)}
                onKeyDown={(e) => handleEditKeyDown(e, subtask.id)}
                className="h-7 text-sm"
                autoFocus
              />
            ) : (
              <span
                className={`flex-1 text-sm cursor-pointer ${
                  subtask.completed ? 'line-through text-muted-foreground' : ''
                }`}
                onClick={() => handleStartEdit(subtask)}
              >
                {subtask.title}
              </span>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={() => onDeleteSubtask(taskId, subtask.id)}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new subtask */}
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          placeholder="Add item..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
        />
        {newSubtaskTitle && (
          <Button
            size="sm"
            onClick={handleAddSubtask}
            className="shrink-0"
          >
            Add
          </Button>
        )}
      </div>
    </div>
  );
}

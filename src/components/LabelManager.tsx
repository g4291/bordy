import React, { useState } from 'react';
import { Pencil, Trash2, Plus, Check } from 'lucide-react';
import { Label, LABEL_COLORS } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface LabelManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: Label[];
  onCreateLabel: (name: string, color: string) => void;
  onUpdateLabel: (id: string, updates: { name?: string; color?: string }) => void;
  onDeleteLabel: (id: string) => void;
}

export function LabelManager({
  open,
  onOpenChange,
  labels,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
}: LabelManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(LABEL_COLORS[0].value);

  const handleStartEdit = (label: Label) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      onUpdateLabel(editingId, { name: editName, color: editColor });
      setEditingId(null);
    }
  };

  const handleCreate = () => {
    onCreateLabel(newName, newColor);
    setNewName('');
    setNewColor(LABEL_COLORS[0].value);
    setIsCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Labels</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto py-2">
          {labels.map((label) => (
            <div key={label.id}>
              {editingId === label.id ? (
                <div className="space-y-2 p-2 border rounded-md bg-muted/50">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Label name (optional)"
                    className="h-8"
                  />
                  <div className="flex flex-wrap gap-1">
                    {LABEL_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setEditColor(color.value)}
                        className={`w-8 h-6 rounded-sm transition-all ${
                          editColor === color.value
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                            : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-8 rounded-sm flex items-center px-3 text-sm font-medium"
                    style={{
                      backgroundColor: label.color,
                      color: getContrastColor(label.color),
                    }}
                  >
                    {label.name || <span className="opacity-50">No name</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleStartEdit(label)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDeleteLabel(label.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {labels.length === 0 && !isCreating && (
            <p className="text-center text-muted-foreground py-4">
              No labels yet. Create your first label!
            </p>
          )}

          {isCreating ? (
            <div className="space-y-2 p-2 border rounded-md bg-muted/50">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Label name (optional)"
                className="h-8"
                autoFocus
              />
              <div className="flex flex-wrap gap-1">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewColor(color.value)}
                    className={`w-8 h-6 rounded-sm transition-all ${
                      newColor === color.value
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate}>
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Label
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LabelPickerProps {
  labels: Label[];
  selectedIds: string[];
  onToggle: (labelId: string) => void;
}

export function LabelPicker({ labels, selectedIds, onToggle }: LabelPickerProps) {
  if (labels.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No labels available. Create labels from the board menu.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => {
        const isSelected = selectedIds.includes(label.id);
        return (
          <button
            key={label.id}
            onClick={() => onToggle(label.id)}
            className={`
              h-7 min-w-[60px] px-2 rounded-sm text-xs font-medium
              flex items-center justify-center gap-1
              transition-all
              ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-60 hover:opacity-100'}
            `}
            style={{
              backgroundColor: label.color,
              color: getContrastColor(label.color),
            }}
          >
            {isSelected && <Check className="h-3 w-3" />}
            <span className="truncate max-w-[80px]">{label.name || 'Label'}</span>
          </button>
        );
      })}
    </div>
  );
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

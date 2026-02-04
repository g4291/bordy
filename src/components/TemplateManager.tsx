import React, { useState } from 'react';
import { Pencil, Trash2, Save, Copy, Lock, AlertTriangle } from 'lucide-react';
import { BoardTemplate } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

// Common template icons for selection
const TEMPLATE_ICONS = [
  '📋', '🎯', '🏃', '📢', '📝', '👥', '🏠', '🐛',
  '💼', '📊', '🚀', '💡', '⭐', '🔧', '📚', '🎨',
  '🛒', '✈️', '🎵', '🎮', '📱', '💻', '🌐', '📅',
];

interface TemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  builtInTemplates: BoardTemplate[];
  customTemplates: BoardTemplate[];
  onSaveCurrentBoard: (name: string, description: string, icon: string) => Promise<void>;
  onUpdateTemplate: (id: string, updates: { name?: string; description?: string; icon?: string }) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  onDuplicateTemplate: (id: string, newName?: string) => Promise<void>;
  hasCurrentBoard: boolean;
}

export function TemplateManager({
  open,
  onOpenChange,
  builtInTemplates,
  customTemplates,
  onSaveCurrentBoard,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  hasCurrentBoard,
}: TemplateManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('📋');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleStartEdit = (template: BoardTemplate) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditDescription(template.description);
    setEditIcon(template.icon);
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      await onUpdateTemplate(editingId, {
        name: editName,
        description: editDescription,
        icon: editIcon,
      });
      setEditingId(null);
    }
  };

  const handleSaveCurrentBoard = async () => {
    if (!newName.trim()) return;
    
    setSaving(true);
    try {
      await onSaveCurrentBoard(newName.trim(), newDescription.trim(), newIcon);
      setNewName('');
      setNewDescription('');
      setNewIcon('📋');
      setIsSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await onDeleteTemplate(id);
    setDeleteConfirmId(null);
  };

  const handleDuplicate = async (template: BoardTemplate) => {
    await onDuplicateTemplate(template.id, `${template.name} (Copy)`);
  };

  const renderTemplate = (template: BoardTemplate, isBuiltIn: boolean) => {
    const isEditing = editingId === template.id;
    const isDeleting = deleteConfirmId === template.id;

    if (isEditing && !isBuiltIn) {
      return (
        <div key={template.id} className="space-y-3 p-3 border rounded-lg bg-muted/50">
          <div className="flex gap-2">
            <div className="flex flex-wrap gap-1 p-2 border rounded bg-background max-w-[200px]">
              {TEMPLATE_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setEditIcon(icon)}
                  className={`w-8 h-8 rounded text-lg hover:bg-muted transition-colors ${
                    editIcon === icon ? 'bg-primary/20 ring-2 ring-primary' : ''
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Template name"
                className="h-9"
              />
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                className="h-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    if (isDeleting) {
      return (
        <div key={template.id} className="p-3 border rounded-lg border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Delete "{template.name}"?</p>
              <p className="text-xs text-muted-foreground mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}>
              Delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={template.id}
        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <span className="text-2xl" role="img" aria-label={template.name}>
          {template.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{template.name}</span>
            {isBuiltIn && (
              <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{template.columns.length} columns</span>
            {template.labels.length > 0 && (
              <>
                <span>•</span>
                <span>{template.labels.length} labels</span>
              </>
            )}
            {template.tasks.length > 0 && (
              <>
                <span>•</span>
                <span>{template.tasks.length} tasks</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleDuplicate(template)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {!isBuiltIn && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleStartEdit(template)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteConfirmId(template.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Templates</DialogTitle>
          <DialogDescription>
            View, edit, and create board templates.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-2 pr-2">
          {/* Save Current Board Section */}
          {hasCurrentBoard && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Current Board as Template
              </h3>
              
              {isSaving ? (
                <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                  <div className="flex gap-2">
                    <div className="flex flex-wrap gap-1 p-2 border rounded bg-background max-w-[200px]">
                      {TEMPLATE_ICONS.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewIcon(icon)}
                          className={`w-8 h-8 rounded text-lg hover:bg-muted transition-colors ${
                            newIcon === icon ? 'bg-primary/20 ring-2 ring-primary' : ''
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Template name"
                        className="h-9"
                        autoFocus
                      />
                      <Input
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleSaveCurrentBoard} 
                      disabled={!newName.trim() || saving}
                    >
                      {saving ? 'Saving...' : 'Save Template'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsSaving(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSaving(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Current Board as Template
                </Button>
              )}
            </div>
          )}

          {/* Custom Templates Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              My Templates ({customTemplates.length})
            </h3>
            {customTemplates.length > 0 ? (
              <div className="space-y-2">
                {customTemplates.map((t) => renderTemplate(t, false))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                No custom templates yet. Save your current board as a template!
              </p>
            )}
          </div>

          {/* Built-in Templates Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-3 w-3" />
              Built-in Templates ({builtInTemplates.length})
            </h3>
            <div className="space-y-2">
              {builtInTemplates.map((t) => renderTemplate(t, true))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

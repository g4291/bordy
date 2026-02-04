import React, { useState } from 'react';
import { BoardTemplate } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { TemplateCard } from './TemplateCard';

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: BoardTemplate[];
  onCreateBoard: (title: string, template?: BoardTemplate) => void;
  onDeleteTemplate?: (id: string) => void;
}

type CreateMode = 'scratch' | 'template';

export function CreateBoardDialog({
  open,
  onOpenChange,
  templates,
  onCreateBoard,
  onDeleteTemplate,
}: CreateBoardDialogProps) {
  const [mode, setMode] = useState<CreateMode>('template');
  const [boardTitle, setBoardTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);

  const handleCreate = () => {
    const title = boardTitle.trim() || (selectedTemplate ? `My ${selectedTemplate.name}` : 'New Board');
    onCreateBoard(title, mode === 'template' ? selectedTemplate || undefined : undefined);
    handleClose();
  };

  const handleClose = () => {
    setBoardTitle('');
    setSelectedTemplate(null);
    setMode('template');
    onOpenChange(false);
  };

  const builtInTemplates = templates.filter(t => t.isBuiltIn);
  const customTemplates = templates.filter(t => !t.isBuiltIn);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Mode selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'template' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('template')}
            >
              Use a template
            </Button>
            <Button
              variant={mode === 'scratch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setMode('scratch');
                setSelectedTemplate(null);
              }}
            >
              Start from scratch
            </Button>
          </div>

          {/* Board name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Board Name</label>
            <Input
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              placeholder={selectedTemplate ? `My ${selectedTemplate.name}` : 'Enter board name'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
            />
          </div>

          {/* Template selection */}
          {mode === 'template' && (
            <div className="space-y-4">
              {/* Built-in templates */}
              <div>
                <h3 className="text-sm font-medium mb-3">Built-in Templates</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {builtInTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      onSelect={() => setSelectedTemplate(template)}
                    />
                  ))}
                </div>
              </div>

              {/* Custom templates */}
              {customTemplates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">My Templates</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {customTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplate?.id === template.id}
                        onSelect={() => setSelectedTemplate(template)}
                        onDelete={onDeleteTemplate ? () => onDeleteTemplate(template.id) : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* From scratch info */}
          {mode === 'scratch' && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-4xl mb-2">📝</p>
              <p className="text-sm">Start with an empty board and add columns manually.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            Create Board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

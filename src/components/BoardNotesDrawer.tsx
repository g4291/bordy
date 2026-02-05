import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { Button } from './ui/button';
import { MarkdownEditor } from './MarkdownEditor';
import { Board } from '../types';

interface BoardNotesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board | null;
  onSaveNotes: (boardId: string, notes: string) => void;
}

export function BoardNotesDrawer({
  open,
  onOpenChange,
  board,
  onSaveNotes,
}: BoardNotesDrawerProps) {
  const [notes, setNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Load notes when board changes or drawer opens
  useEffect(() => {
    if (board && open) {
      setNotes(board.notes || '');
      setHasChanges(false);
    }
  }, [board, open]);

  // Track changes
  useEffect(() => {
    if (board) {
      setHasChanges(notes !== (board.notes || ''));
    }
  }, [notes, board]);

  const handleSave = () => {
    if (board) {
      onSaveNotes(board.id, notes);
      setHasChanges(false);
    }
  };

  const handleClose = () => {
    // Auto-save on close if there are changes
    if (hasChanges && board) {
      onSaveNotes(board.id, notes);
    }
    onOpenChange(false);
  };

  if (!board) return null;

  // Determine default mode based on whether notes exist
  const defaultMode = notes.trim() ? 'preview' : 'write';

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Board Notes
          </SheetTitle>
          <SheetDescription>
            Notes for <strong>{board.title}</strong>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-4">
          <MarkdownEditor
            value={notes}
            onChange={setNotes}
            placeholder="Write notes for this board...

Examples:
- Project overview
- Important links
- Team contacts
- Meeting notes"
            minHeight="200px"
            showHelp={true}
            autoResize={true}
            defaultMode={defaultMode}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {hasChanges ? (
              <span className="text-amber-500">● Unsaved changes</span>
            ) : (
              <span className="text-green-500">✓ Saved</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

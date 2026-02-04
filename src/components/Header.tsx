import React, { useState, useRef } from 'react';
import {
  Plus,
  Download,
  Upload,
  Trash2,
  Pencil,
  ChevronDown,
  LayoutDashboard,
  Moon,
  Sun,
  AlertTriangle,
  Tags,
} from 'lucide-react';
import { Board, Label } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { LabelManager } from './LabelManager';

interface HeaderProps {
  boards: Board[];
  currentBoard: Board | null;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (title: string) => void;
  onUpdateBoard: (id: string, title: string) => void;
  onDeleteBoard: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  labels: Label[];
  onCreateLabel: (name: string, color: string) => void;
  onUpdateLabel: (id: string, updates: { name?: string; color?: string }) => void;
  onDeleteLabel: (id: string) => void;
}

export function Header({
  boards,
  currentBoard,
  onSelectBoard,
  onCreateBoard,
  onUpdateBoard,
  onDeleteBoard,
  onExport,
  onImport,
  theme,
  onToggleTheme,
  labels,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
}: HeaderProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateBoard = () => {
    if (boardTitle.trim()) {
      onCreateBoard(boardTitle.trim());
      setBoardTitle('');
      setIsCreating(false);
    }
  };

  const handleEditBoard = () => {
    if (currentBoard && boardTitle.trim()) {
      onUpdateBoard(currentBoard.id, boardTitle.trim());
      setBoardTitle('');
      setIsEditing(false);
    }
  };

  const handleDeleteBoard = () => {
    if (currentBoard) {
      onDeleteBoard(currentBoard.id);
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Bordy</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-between">
                {currentBoard?.title || 'Select Board'}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {boards.map((board) => (
                <DropdownMenuItem
                  key={board.id}
                  onClick={() => onSelectBoard(board)}
                  className={currentBoard?.id === board.id ? 'bg-accent' : ''}
                >
                  {board.title}
                </DropdownMenuItem>
              ))}
              {boards.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {currentBoard && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setBoardTitle(currentBoard.title);
                  setIsEditing(true);
                }}
                title="Edit board"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLabelManagerOpen(true)}
                title="Manage labels"
              >
                <Tags className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleting(true)}
                title="Delete board"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Create Board Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <Input
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            placeholder="Board title"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateBoard();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBoard}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Board Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <Input
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            placeholder="Board title"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditBoard();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBoard}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Board Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Board
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "<strong>{currentBoard?.title}</strong>"? 
              This will permanently delete the board and all its columns and tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBoard}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Label Manager Dialog */}
      <LabelManager
        open={isLabelManagerOpen}
        onOpenChange={setIsLabelManagerOpen}
        labels={labels}
        onCreateLabel={onCreateLabel}
        onUpdateLabel={onUpdateLabel}
        onDeleteLabel={onDeleteLabel}
      />
    </header>
  );
}

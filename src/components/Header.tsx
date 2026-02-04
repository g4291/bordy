import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Download,
  Upload,
  Trash2,
  Pencil,
  ChevronDown,
  Moon,
  Sun,
  AlertTriangle,
  Tags,
  FileStack,
  Keyboard,
} from 'lucide-react';
import { Logo } from './Logo';
import { Board, Label, BoardTemplate, TaskPriority } from '../types';
import { TaskFilters, DueDateFilter } from '../hooks/useTaskFilter';
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
import { TemplatePicker } from './TemplatePicker';
import { TemplateManager } from './TemplateManager';
import { SearchBar } from './SearchBar';
import { FilterDropdown } from './FilterDropdown';
import { ActiveFilters } from './ActiveFilters';
import { BUILT_IN_TEMPLATES } from '../lib/templates';

interface HeaderProps {
  boards: Board[];
  currentBoard: Board | null;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (title: string, template?: BoardTemplate) => void;
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
  // Template props
  allTemplates: BoardTemplate[];
  builtInTemplates: BoardTemplate[];
  customTemplates: BoardTemplate[];
  onSaveCurrentBoardAsTemplate: (name: string, description: string, icon: string) => Promise<void>;
  onUpdateTemplate: (id: string, updates: { name?: string; description?: string; icon?: string }) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  onDuplicateTemplate: (id: string, newName?: string) => Promise<void>;
  // Filter props
  filters: TaskFilters;
  onSearchChange: (query: string) => void;
  onToggleLabelFilter: (labelId: string) => void;
  onDueDateFilterChange: (filter: DueDateFilter) => void;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onRemoveLabelFilter: (labelId: string) => void;
  onClearDueDateFilter: () => void;
  onTogglePriorityFilter: (priority: TaskPriority) => void;
  onRemovePriorityFilter: (priority: TaskPriority) => void;
  activeFilterCount: number;
  filteredTaskCount?: number;
  totalTaskCount?: number;
  hasActiveFilters: boolean;
  // Keyboard shortcut props
  searchInputRef?: React.RefObject<HTMLInputElement>;
  onShowShortcutsHelp?: () => void;
  onDialogOpenChange?: (isOpen: boolean) => void;
  // External dialog control
  isNewBoardDialogOpen?: boolean;
  setIsNewBoardDialogOpen?: (open: boolean) => void;
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
  // Template props
  allTemplates,
  builtInTemplates,
  customTemplates,
  onSaveCurrentBoardAsTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  // Filter props
  filters,
  onSearchChange,
  onToggleLabelFilter,
  onDueDateFilterChange,
  onClearFilters,
  onClearSearch,
  onRemoveLabelFilter,
  onClearDueDateFilter,
  onTogglePriorityFilter,
  onRemovePriorityFilter,
  activeFilterCount,
  filteredTaskCount,
  totalTaskCount,
  hasActiveFilters,
  // Keyboard shortcut props
  searchInputRef,
  onShowShortcutsHelp,
  onDialogOpenChange,
  // External dialog control
  isNewBoardDialogOpen,
  setIsNewBoardDialogOpen,
}: HeaderProps) {
  const [isCreatingInternal, setIsCreatingInternal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(
    BUILT_IN_TEMPLATES[0]
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use external or internal state for create dialog
  const isCreating = isNewBoardDialogOpen ?? isCreatingInternal;
  const setIsCreating = setIsNewBoardDialogOpen ?? setIsCreatingInternal;

  // Notify parent about dialog state changes
  useEffect(() => {
    onDialogOpenChange?.(isCreating || isEditing || isDeleting || isLabelManagerOpen || isTemplateManagerOpen);
  }, [isCreating, isEditing, isDeleting, isLabelManagerOpen, isTemplateManagerOpen, onDialogOpenChange]);

  const handleCreateBoard = () => {
    if (boardTitle.trim()) {
      onCreateBoard(boardTitle.trim(), selectedTemplate || undefined);
      setBoardTitle('');
      setSelectedTemplate(BUILT_IN_TEMPLATES[0]);
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

  const handleOpenCreateDialog = () => {
    setBoardTitle('');
    // Use first template from all templates (prefer built-in blank)
    setSelectedTemplate(allTemplates[0] || BUILT_IN_TEMPLATES[0]);
    setIsCreating(true);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="app-header">
      <div className="flex items-center justify-between h-14 px-4 gap-4">
        {/* Left section: Logo, Board selector, Board actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <a
            href="https://bordy.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Visit bordy.online"
          >
            <Logo size={28} />
            <h1 className="text-xl font-bold hidden sm:block">Bordy</h1>
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[140px] sm:min-w-[200px] justify-between" data-testid="board-selector">
                <span className="truncate">{currentBoard?.title || 'Select Board'}</span>
                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {boards.map((board, index) => (
                <DropdownMenuItem
                  key={board.id}
                  onClick={() => onSelectBoard(board)}
                  className={currentBoard?.id === board.id ? 'bg-accent' : ''}
                >
                  <span className="flex items-center gap-2 w-full">
                    {index < 9 && (
                      <kbd className="px-1 py-0.5 text-[10px] font-mono bg-muted rounded border opacity-60">
                        {index + 1}
                      </kbd>
                    )}
                    <span className="truncate">{board.title}</span>
                  </span>
                </DropdownMenuItem>
              ))}
              {boards.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={handleOpenCreateDialog} data-testid="new-board-menu-item">
                <Plus className="h-4 w-4 mr-2" />
                New Board
                <kbd className="ml-auto px-1 py-0.5 text-[10px] font-mono bg-muted rounded border opacity-60">
                  B
                </kbd>
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
                onClick={() => setIsTemplateManagerOpen(true)}
                title="Manage templates"
                className="hidden sm:flex"
              >
                <FileStack className="h-4 w-4" />
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

        {/* Center section: Search and Filter (only when board is selected) */}
        {currentBoard && (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <SearchBar
              ref={searchInputRef}
              value={filters.searchQuery}
              onChange={onSearchChange}
              placeholder="Search tasks..."
              className="flex-1"
            />
            <FilterDropdown
              labels={labels}
              selectedLabelIds={filters.labelIds}
              dueDateFilter={filters.dueDateFilter}
              onToggleLabelFilter={onToggleLabelFilter}
              selectedPriorities={filters.priorities}
              onTogglePriorityFilter={onTogglePriorityFilter}
              onDueDateFilterChange={onDueDateFilterChange}
              activeFilterCount={activeFilterCount}
            />
          </div>
        )}

        {/* Right section: Theme, Shortcuts, Import, Export */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Keyboard shortcuts button */}
          {onShowShortcutsHelp && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowShortcutsHelp}
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode (D)' : 'Switch to dark mode (D)'}
            data-testid="toggle-theme"
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
            data-testid="import-file-input"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex"
            data-testid="import-button"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="hidden sm:flex"
            data-testid="export-button"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {/* Mobile: compact import/export */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="sm:hidden"
            title="Import"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onExport}
            className="sm:hidden"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters Bar - shown below header when filters are active */}
      {currentBoard && hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          labels={labels}
          onClearSearch={onClearSearch}
          onRemoveLabelFilter={onRemoveLabelFilter}
          onRemovePriorityFilter={onRemovePriorityFilter}
          onClearDueDateFilter={onClearDueDateFilter}
          onClearAll={onClearFilters}
          filteredCount={filteredTaskCount}
          totalCount={totalTaskCount}
        />
      )}

      {/* Create Board Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>
              Choose a template and give your board a name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Board Name</label>
              <Input
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                placeholder="Enter board name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBoard();
                }}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Template</label>
              <TemplatePicker
                templates={allTemplates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBoard} disabled={!boardTitle.trim()}>
              Create Board
            </Button>
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

      {/* Template Manager Dialog */}
      <TemplateManager
        open={isTemplateManagerOpen}
        onOpenChange={setIsTemplateManagerOpen}
        builtInTemplates={builtInTemplates}
        customTemplates={customTemplates}
        onSaveCurrentBoard={onSaveCurrentBoardAsTemplate}
        onUpdateTemplate={onUpdateTemplate}
        onDeleteTemplate={onDeleteTemplate}
        onDuplicateTemplate={onDuplicateTemplate}
        hasCurrentBoard={!!currentBoard}
      />
    </header>
  );
}

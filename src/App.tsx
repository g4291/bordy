import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useKanban } from './hooks/useKanban';
import { useTheme } from './hooks/useTheme';
import { useTemplates } from './hooks/useTemplates';
import { useTaskFilter } from './hooks/useTaskFilter';
import { useKeyboardShortcuts, Shortcut } from './hooks/useKeyboardShortcuts';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { ShortcutsHelpDialog } from './components/ShortcutsHelpDialog';
import { BoardNotesDrawer } from './components/BoardNotesDrawer';
import { ToastProvider, useToast } from './components/ui/toast';
import { ViewSwitcher, CalendarView, AgendaView, TaskDetailDialog, getNextViewMode } from './components/views';
import { Column, Task, ViewMode, CalendarMode } from './types';

const VIEW_MODE_STORAGE_KEY = 'bordy-view-mode';

function AppContent() {
  const {
    boards,
    currentBoard,
    columns,
    tasks,
    labels,
    loading,
    setCurrentBoard,
    createBoard,
    updateBoard,
    updateBoardNotes,
    deleteBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    toggleTaskComplete,
    updateSubtask,
    addComment,
    updateComment,
    deleteComment,
    addAttachment,
    deleteAttachment,
    createLabel,
    updateLabel,
    deleteLabel,
    exportData,
    importData,
  } = useKanban();

  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const {
    customTemplates,
    builtInTemplates,
    getAllTemplates,
    saveCurrentBoardAsTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useTemplates();

  const {
    filters,
    setSearchQuery,
    toggleLabelFilter,
    setDueDateFilter,
    togglePriorityFilter,
    clearFilters,
    clearSearch,
    removeLabelFilter,
    clearDueDateFilter,
    removePriorityFilter,
    setCompletionFilter,
    clearCompletionFilter,
    filterTasks,
    hasActiveFilters,
    activeFilterCount,
  } = useTaskFilter(currentBoard?.id);

  // View mode state with persistence
  const [viewMode, setViewModeState] = useState<ViewMode>('kanban');

  // Load view mode from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (stored && ['kanban', 'calendar', 'agenda'].includes(stored)) {
        setViewModeState(stored as ViewMode);
      }
    } catch (error) {
      console.error('Failed to load view mode:', error);
    }
  }, []);

  // Set view mode with persistence
  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save view mode:', error);
    }
  }, []);

  // Shortcuts dialog state
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  // New task dialog state (will be passed to Header)
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  // New board dialog state (will be passed to Header)
  const [isNewBoardDialogOpen, setIsNewBoardDialogOpen] = useState(false);

  // Board notes drawer state
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);

  // Task detail dialog state (for Calendar/Agenda views)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Keep selectedTask in sync with actual task data
  useEffect(() => {
    if (selectedTask && isTaskDetailOpen) {
      // Find the updated task in the tasks map
      let updatedTask: Task | null = null;
      for (const [, columnTasks] of tasks) {
        const found = columnTasks.find(t => t.id === selectedTask.id);
        if (found) {
          updatedTask = found;
          break;
        }
      }
      
      if (updatedTask) {
        // Task still exists, update it
        if (JSON.stringify(updatedTask) !== JSON.stringify(selectedTask)) {
          setSelectedTask(updatedTask);
        }
      } else {
        // Task was deleted, close the dialog
        setSelectedTask(null);
        setIsTaskDetailOpen(false);
      }
    }
  }, [tasks, selectedTask, isTaskDetailOpen]);

  // Ref for search input focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calendar control refs and state
  const calendarControlsRef = useRef<{
    goToToday: () => void;
    goToPrevious: () => void;
    goToNext: () => void;
    setCalendarMode: (mode: CalendarMode) => void;
    calendarMode: CalendarMode;
  } | null>(null);

  // Track if any dialog is open to disable shortcuts
  const [dialogOpenCount, setDialogOpenCount] = useState(0);
  const isAnyDialogOpen = dialogOpenCount > 0 || isShortcutsHelpOpen || isTaskDetailOpen || isNotesDrawerOpen;

  const handleDialogOpenChange = useCallback((isOpen: boolean) => {
    setDialogOpenCount((prev) => (isOpen ? prev + 1 : Math.max(0, prev - 1)));
  }, []);

  // Navigate between boards
  const navigateBoard = useCallback(
    (direction: -1 | 1) => {
      if (boards.length === 0) return;

      const currentIndex = currentBoard
        ? boards.findIndex((b) => b.id === currentBoard.id)
        : -1;

      let newIndex: number;
      if (currentIndex === -1) {
        newIndex = direction === 1 ? 0 : boards.length - 1;
      } else {
        newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = boards.length - 1;
        if (newIndex >= boards.length) newIndex = 0;
      }

      const newBoard = boards[newIndex];
      if (newBoard && newBoard.id !== currentBoard?.id) {
        setCurrentBoard(newBoard);
        showToast(`📋 ${newBoard.title}`, 'default', 1500);
      }
    },
    [boards, currentBoard, setCurrentBoard, showToast]
  );

  // Select board by number (1-9)
  const selectBoardByNumber = useCallback(
    (num: number) => {
      const index = num - 1;
      if (index >= 0 && index < boards.length) {
        const board = boards[index];
        if (board.id !== currentBoard?.id) {
          setCurrentBoard(board);
          showToast(`📋 ${board.title}`, 'default', 1500);
        }
      }
    },
    [boards, currentBoard, setCurrentBoard, showToast]
  );

  // Focus search input
  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, []);

  // Create task in first column
  const openNewTaskDialog = useCallback(() => {
    if (!currentBoard || columns.length === 0) {
      showToast('No columns available', 'error', 2000);
      return;
    }
    setIsNewTaskDialogOpen(true);
  }, [currentBoard, columns, showToast]);

  // Open new board dialog
  const openNewBoardDialog = useCallback(() => {
    setIsNewBoardDialogOpen(true);
  }, []);

  // Cycle through view modes
  const cycleViewMode = useCallback(() => {
    const nextMode = getNextViewMode(viewMode);
    setViewMode(nextMode);
    const modeLabels = { kanban: 'Kanban', calendar: 'Calendar', agenda: 'Agenda' };
    showToast(`🔄 ${modeLabels[nextMode]} view`, 'default', 1500);
  }, [viewMode, setViewMode, showToast]);

  // Calendar keyboard shortcuts handlers
  const handleCalendarToday = useCallback(() => {
    if (viewMode === 'calendar' && calendarControlsRef.current) {
      calendarControlsRef.current.goToToday();
      showToast('📅 Today', 'default', 1000);
    }
  }, [viewMode, showToast]);

  const handleCalendarPrevious = useCallback(() => {
    if (viewMode === 'calendar' && calendarControlsRef.current) {
      calendarControlsRef.current.goToPrevious();
    }
  }, [viewMode]);

  const handleCalendarNext = useCallback(() => {
    if (viewMode === 'calendar' && calendarControlsRef.current) {
      calendarControlsRef.current.goToNext();
    }
  }, [viewMode]);

  const handleCalendarMonthView = useCallback(() => {
    if (viewMode === 'calendar' && calendarControlsRef.current) {
      calendarControlsRef.current.setCalendarMode('month');
      showToast('📅 Month view', 'default', 1000);
    }
  }, [viewMode, showToast]);

  const handleCalendarWeekView = useCallback(() => {
    if (viewMode === 'calendar' && calendarControlsRef.current) {
      calendarControlsRef.current.setCalendarMode('week');
      showToast('📅 Week view', 'default', 1000);
    }
  }, [viewMode, showToast]);

  // Handle import with toast notification
  const handleImport = useCallback(async (file: File) => {
    const result = await importData(file);
    if (result.success) {
      showToast(`✅ ${result.message}`, 'success', 3000);
    } else {
      showToast(`❌ ${result.message}`, 'error', 4000);
    }
  }, [importData, showToast]);

  // Handle export with toast notification
  const handleExport = useCallback(async () => {
    const result = await exportData();
    if (result.success) {
      showToast(`📦 ${result.message}`, 'success', 3000);
    } else {
      showToast(`❌ ${result.message}`, 'error', 4000);
    }
  }, [exportData, showToast]);

  // Define keyboard shortcuts
  const shortcuts: Shortcut[] = useMemo(
    () => [
      // Help
      {
        key: '?',
        shift: true,
        action: () => setIsShortcutsHelpOpen(true),
        description: 'Show keyboard shortcuts',
        category: 'dialogs',
      },
      // Navigation
      {
        key: 'ArrowLeft',
        action: () => navigateBoard(-1),
        description: 'Previous board',
        category: 'navigation',
      },
      {
        key: 'ArrowRight',
        action: () => navigateBoard(1),
        description: 'Next board',
        category: 'navigation',
      },
      {
        key: '/',
        action: focusSearch,
        description: 'Focus search',
        category: 'navigation',
      },
      // Actions
      {
        key: 'n',
        action: openNewTaskDialog,
        description: 'New task',
        category: 'actions',
      },
      {
        key: 'b',
        action: openNewBoardDialog,
        description: 'New board',
        category: 'actions',
      },
      {
        key: 'd',
        action: toggleTheme,
        description: 'Toggle theme',
        category: 'actions',
      },
      // View mode
      {
        key: 'v',
        action: cycleViewMode,
        description: 'Cycle view mode',
        category: 'views',
      },
      // Calendar-specific shortcuts
      {
        key: 't',
        action: handleCalendarToday,
        description: 'Go to today (Calendar)',
        category: 'views',
        enabled: viewMode === 'calendar',
      },
      {
        key: 'm',
        action: handleCalendarMonthView,
        description: 'Month view (Calendar)',
        category: 'views',
        enabled: viewMode === 'calendar',
      },
      {
        key: 'w',
        action: handleCalendarWeekView,
        description: 'Week view (Calendar)',
        category: 'views',
        enabled: viewMode === 'calendar',
      },
      {
        key: '[',
        action: handleCalendarPrevious,
        description: 'Previous (Calendar)',
        category: 'views',
        enabled: viewMode === 'calendar',
      },
      {
        key: ']',
        action: handleCalendarNext,
        description: 'Next (Calendar)',
        category: 'views',
        enabled: viewMode === 'calendar',
      },
      // Number shortcuts 1-9
      ...Array.from({ length: 9 }, (_, i) => ({
        key: String(i + 1),
        action: () => selectBoardByNumber(i + 1),
        description: `Board ${i + 1}`,
        category: 'navigation' as const,
      })),
    ],
    [
      navigateBoard,
      focusSearch,
      openNewTaskDialog,
      openNewBoardDialog,
      toggleTheme,
      selectBoardByNumber,
      cycleViewMode,
      handleCalendarToday,
      handleCalendarMonthView,
      handleCalendarWeekView,
      handleCalendarPrevious,
      handleCalendarNext,
      viewMode,
    ]
  );

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts,
    enabled: !isAnyDialogOpen,
  });

  // Calculate task stats for the active filters display
  const taskStats = useMemo(() => {
    let totalTasks = 0;
    let filteredTasks = 0;

    columns.forEach((column: Column) => {
      const columnTasks = tasks.get(column.id) || [];
      totalTasks += columnTasks.length;
      filteredTasks += filterTasks(columnTasks).length;
    });

    return { total: totalTasks, filtered: filteredTasks };
  }, [columns, tasks, filterTasks]);

  // Flatten tasks for calendar/agenda views
  const allTasks = useMemo((): Task[] => {
    const flatTasks: Task[] = [];
    columns.forEach((column: Column) => {
      const columnTasks = tasks.get(column.id) || [];
      flatTasks.push(...columnTasks);
    });
    return flatTasks;
  }, [columns, tasks]);

  // Filtered flat tasks for calendar/agenda
  const filteredAllTasks = useMemo(() => {
    return filterTasks(allTasks);
  }, [allTasks, filterTasks]);

  // Get first column ID for creating tasks
  const firstColumnId = columns.length > 0 ? columns[0].id : undefined;

  // Handler for task click in calendar/agenda views
  const handleCalendarTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  }, []);

  // Handler for task date change (drag & drop in calendar)
  const handleTaskDateChange = useCallback((taskId: string, newDate: Date) => {
    updateTask(taskId, { dueDate: newDate.getTime() });
    showToast('📅 Due date updated', 'success', 1500);
  }, [updateTask, showToast]);

  // Handler for saving current board as template
  const handleSaveCurrentBoardAsTemplate = async (
    name: string,
    description: string,
    icon: string
  ) => {
    await saveCurrentBoardAsTemplate(name, description, icon, columns, tasks, labels);
  };

  // Handler for duplicating template (wrapper to return void)
  const handleDuplicateTemplate = async (id: string, newName?: string) => {
    await duplicateTemplate(id, newName);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header
        boards={boards}
        currentBoard={currentBoard}
        onSelectBoard={setCurrentBoard}
        onCreateBoard={createBoard}
        onUpdateBoard={updateBoard}
        onDeleteBoard={deleteBoard}
        onExport={handleExport}
        onImport={handleImport}
        theme={theme}
        onToggleTheme={toggleTheme}
        labels={labels}
        onCreateLabel={createLabel}
        onUpdateLabel={updateLabel}
        onDeleteLabel={deleteLabel}
        // Template props
        allTemplates={getAllTemplates()}
        builtInTemplates={builtInTemplates}
        customTemplates={customTemplates}
        onSaveCurrentBoardAsTemplate={handleSaveCurrentBoardAsTemplate}
        onUpdateTemplate={updateTemplate}
        onDeleteTemplate={deleteTemplate}
        onDuplicateTemplate={handleDuplicateTemplate}
        // Filter props
        filters={filters}
        onSearchChange={setSearchQuery}
        onToggleLabelFilter={toggleLabelFilter}
        onDueDateFilterChange={setDueDateFilter}
        onClearFilters={clearFilters}
        onClearSearch={clearSearch}
        onRemoveLabelFilter={removeLabelFilter}
        onClearDueDateFilter={clearDueDateFilter}
        onTogglePriorityFilter={togglePriorityFilter}
        onRemovePriorityFilter={removePriorityFilter}
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        onCompletionFilterChange={setCompletionFilter}
        onClearCompletionFilter={clearCompletionFilter}
        filteredTaskCount={taskStats.filtered}
        totalTaskCount={taskStats.total}
        // Keyboard shortcut props
        searchInputRef={searchInputRef}
        onShowShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
        onDialogOpenChange={handleDialogOpenChange}
        // External dialog control
        isNewBoardDialogOpen={isNewBoardDialogOpen}
        setIsNewBoardDialogOpen={setIsNewBoardDialogOpen}
        // Notes drawer control
        isNotesDrawerOpen={isNotesDrawerOpen}
        setIsNotesDrawerOpen={setIsNotesDrawerOpen}
      />

      {/* View Switcher - shown when board is selected */}
      {currentBoard && (
        <div className="flex items-center justify-center py-2 border-b bg-muted/30">
          <ViewSwitcher
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      )}

      {currentBoard ? (
        <>
          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <KanbanBoard
              columns={columns}
              tasks={tasks}
              labels={labels}
              onCreateColumn={createColumn}
              onUpdateColumn={updateColumn}
              onReorderColumns={reorderColumns}
              onDeleteColumn={deleteColumn}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onMoveTask={moveTask}
              // Filter props
              filterTasks={filterTasks}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              // Subtask props
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onDeleteSubtask={deleteSubtask}
              onUpdateSubtask={updateSubtask}
              // Comment props
              onAddComment={addComment}
              onUpdateComment={updateComment}
              onDeleteComment={deleteComment}
              // Attachment props
              onAddAttachment={addAttachment}
              onDeleteAttachment={deleteAttachment}
              // Keyboard shortcut props
              isNewTaskDialogOpen={isNewTaskDialogOpen}
              setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
              onDialogOpenChange={handleDialogOpenChange}
              // Completion handler
              onToggleTaskComplete={toggleTaskComplete}
            />
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <CalendarView
              tasks={filteredAllTasks}
              labels={labels}
              onTaskClick={handleCalendarTaskClick}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
              onTaskDateChange={handleTaskDateChange}
              defaultColumnId={firstColumnId}
              controlsRef={calendarControlsRef}
            />
          )}

          {/* Agenda View */}
          {viewMode === 'agenda' && (
            <AgendaView
              tasks={filteredAllTasks}
              labels={labels}
              onTaskClick={handleCalendarTaskClick}
            />
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Welcome to Bordy</h2>
            <p className="text-muted-foreground mb-4">
              Create your first board to get started
            </p>
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">B</kbd> to create a new board
            </p>
          </div>
        </div>
      )}

      {/* Shortcuts Help Dialog */}
      <ShortcutsHelpDialog
        open={isShortcutsHelpOpen}
        onOpenChange={setIsShortcutsHelpOpen}
      />

      {/* Task Detail Dialog (for Calendar/Agenda views) */}
      <TaskDetailDialog
        task={selectedTask}
        labels={labels}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onAddSubtask={addSubtask}
        onToggleSubtask={toggleSubtask}
        onDeleteSubtask={deleteSubtask}
        onUpdateSubtask={updateSubtask}
        onAddComment={addComment}
        onUpdateComment={updateComment}
        onDeleteComment={deleteComment}
        onAddAttachment={addAttachment}
        onDeleteAttachment={deleteAttachment}
        onToggleComplete={toggleTaskComplete}
      />

      {/* Board Notes Drawer */}
      <BoardNotesDrawer
        open={isNotesDrawerOpen}
        onOpenChange={setIsNotesDrawerOpen}
        board={currentBoard}
        onSaveNotes={updateBoardNotes}
      />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;

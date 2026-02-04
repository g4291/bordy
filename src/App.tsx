import React, { useMemo } from 'react';
import { useKanban } from './hooks/useKanban';
import { useTheme } from './hooks/useTheme';
import { useTemplates } from './hooks/useTemplates';
import { useTaskFilter } from './hooks/useTaskFilter';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';

function App() {
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
    updateSubtask,
    createLabel,
    updateLabel,
    deleteLabel,
    exportData,
    importData,
  } = useKanban();

  const { theme, toggleTheme } = useTheme();

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
    clearFilters,
    clearSearch,
    removeLabelFilter,
    clearDueDateFilter,
    filterTasks,
    hasActiveFilters,
    activeFilterCount,
  } = useTaskFilter(currentBoard?.id);

  // Calculate task stats for the active filters display
  const taskStats = useMemo(() => {
    let totalTasks = 0;
    let filteredTasks = 0;
    
    columns.forEach(column => {
      const columnTasks = tasks.get(column.id) || [];
      totalTasks += columnTasks.length;
      filteredTasks += filterTasks(columnTasks).length;
    });

    return { total: totalTasks, filtered: filteredTasks };
  }, [columns, tasks, filterTasks]);

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
        onExport={exportData}
        onImport={importData}
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
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        filteredTaskCount={taskStats.filtered}
        totalTaskCount={taskStats.total}
      />

      {currentBoard ? (
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
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Welcome to Bordy</h2>
            <p className="text-muted-foreground mb-4">
              Create your first board to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

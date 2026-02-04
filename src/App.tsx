import React from 'react';
import { useKanban } from './hooks/useKanban';
import { useTheme } from './hooks/useTheme';
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
    createLabel,
    updateLabel,
    deleteLabel,
    exportData,
    importData,
  } = useKanban();

  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
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

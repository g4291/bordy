import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Board, Column, Task, Label, KanbanData, BoardTemplate, TemplateColumn, TemplateLabel, TemplateTask } from '../types';
import * as db from '../lib/db';

export function useKanban() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Map<string, Task[]>>(new Map());
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all boards on mount
  useEffect(() => {
    loadBoards();
  }, []);

  // Load columns, tasks, and labels when current board changes
  useEffect(() => {
    if (currentBoard) {
      loadBoardData(currentBoard.id);
    }
  }, [currentBoard?.id]);

  const loadBoards = async () => {
    try {
      const allBoards = await db.getAllBoards();
      setBoards(allBoards);
      if (allBoards.length > 0 && !currentBoard) {
        setCurrentBoard(allBoards[0]);
      }
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBoardData = async (boardId: string) => {
    try {
      const boardColumns = await db.getColumnsByBoard(boardId);
      setColumns(boardColumns);

      const tasksMap = new Map<string, Task[]>();
      for (const column of boardColumns) {
        const columnTasks = await db.getTasksByColumn(column.id);
        tasksMap.set(column.id, columnTasks);
      }
      setTasks(tasksMap);

      // Load labels for this board
      const boardLabels = await db.getLabelsByBoard(boardId);
      setLabels(boardLabels);
    } catch (error) {
      console.error('Failed to load board data:', error);
    }
  };

  // Board operations
  const createBoard = useCallback(async (title: string, template?: BoardTemplate) => {
    const now = Date.now();
    const board: Board = {
      id: uuidv4(),
      title,
      createdAt: now,
      updatedAt: now,
    };
    await db.saveBoard(board);
    setBoards(prev => [...prev, board]);
    
    
    // Create columns from template or default
    const columnTitles = template 
      ? template.columns.map((c: TemplateColumn) => c.title)
      : ['To Do', 'In Progress', 'Done'];
    
    const createdColumns: Column[] = [];
    for (let i = 0; i < columnTitles.length; i++) {
      const column: Column = {
        id: uuidv4(),
        title: columnTitles[i],
        boardId: board.id,
        order: i,
      };
      await db.saveColumn(column);
      createdColumns.push(column);
    }
    
    // Create labels from template
    const createdLabels: Label[] = [];
    if (template && template.labels) {
      for (const tLabel of template.labels as TemplateLabel[]) {
        const label: Label = {
          id: uuidv4(),
          name: tLabel.name,
          color: tLabel.color,
          boardId: board.id,
        };
        await db.saveLabel(label);
        createdLabels.push(label);
      }
    }
    
    // Create tasks from template
    if (template && template.tasks) {
      for (const tTask of template.tasks as TemplateTask[]) {
        const targetColumn = createdColumns[tTask.columnIndex];
        if (targetColumn) {
          const taskLabelIds = tTask.labelIndices
            .map((idx: number) => createdLabels[idx]?.id)
            .filter((id: string | undefined): id is string => id !== undefined);
          
          const task: Task = {
            id: uuidv4(),
            title: tTask.title,
            description: tTask.description,
            columnId: targetColumn.id,
            order: 0,
            labelIds: taskLabelIds,
            createdAt: now,
            updatedAt: now,
          };
          await db.saveTask(task);
        }
      }
    }
    
    setCurrentBoard(board);
    return board;
  }, []);

  const updateBoard = useCallback(async (id: string, title: string) => {
    const board = boards.find(b => b.id === id);
    if (!board) return;

    const updated: Board = { ...board, title, updatedAt: Date.now() };
    await db.saveBoard(updated);
    setBoards(prev => prev.map(b => b.id === id ? updated : b));
    if (currentBoard?.id === id) {
      setCurrentBoard(updated);
    }
  }, [boards, currentBoard]);

  const deleteBoard = useCallback(async (id: string) => {
    await db.deleteBoard(id);
    setBoards(prev => prev.filter(b => b.id !== id));
    if (currentBoard?.id === id) {
      const remaining = boards.filter(b => b.id !== id);
      setCurrentBoard(remaining.length > 0 ? remaining[0] : null);
    }
  }, [boards, currentBoard]);

  // Column operations
  const createColumn = useCallback(async (title: string) => {
    if (!currentBoard) return;

    const column: Column = {
      id: uuidv4(),
      title,
      boardId: currentBoard.id,
      order: columns.length,
    };
    await db.saveColumn(column);
    setColumns(prev => [...prev, column]);
    setTasks(prev => new Map(prev).set(column.id, []));
  }, [currentBoard, columns.length]);

  const updateColumn = useCallback(async (id: string, title: string) => {
    const column = columns.find(c => c.id === id);
    if (!column) return;

    const updated: Column = { ...column, title };
    await db.saveColumn(updated);
    setColumns(prev => prev.map(c => c.id === id ? updated : c));
  }, [columns]);

  const deleteColumn = useCallback(async (id: string) => {
    await db.deleteColumn(id);
    setColumns(prev => prev.filter(c => c.id !== id));
    setTasks(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const reorderColumns = useCallback(async (newColumns: Column[]) => {
    const updated = newColumns.map((col, idx) => ({ ...col, order: idx }));
    for (const column of updated) {
      await db.saveColumn(column);
    }
    setColumns(updated);
  }, []);

  // Task operations
  const createTask = useCallback(async (columnId: string, title: string, description?: string, dueDate?: number) => {
    const columnTasks = tasks.get(columnId) || [];
    const now = Date.now();
    
    const task: Task = {
      id: uuidv4(),
      title,
      description,
      columnId,
      order: columnTasks.length,
      labelIds: [],
      dueDate,
      createdAt: now,
      updatedAt: now,
    };
    await db.saveTask(task);
    setTasks(prev => {
      const next = new Map(prev);
      next.set(columnId, [...(next.get(columnId) || []), task]);
      return next;
    });
  }, [tasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds' | 'dueDate'>>) => {
    const entries = Array.from(tasks.entries());
    for (const [columnId, columnTasks] of entries) {
      const task = columnTasks.find((t: Task) => t.id === id);
      if (task) {
        const updated: Task = { ...task, ...updates, updatedAt: Date.now() };
        await db.saveTask(updated);
        setTasks(prev => {
          const next = new Map(prev);
          next.set(columnId, columnTasks.map((t: Task) => t.id === id ? updated : t));
          return next;
        });
        return;
      }
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    await db.deleteTask(id);
    setTasks(prev => {
      const next = new Map(prev);
      const entries = Array.from(next.entries());
      for (const [columnId, columnTasks] of entries) {
        if (columnTasks.some((t: Task) => t.id === id)) {
          next.set(columnId, columnTasks.filter((t: Task) => t.id !== id));
          break;
        }
      }
      return next;
    });
  }, []);

  const moveTask = useCallback(async (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newIndex: number
  ) => {
    const sourceTasks = tasks.get(sourceColumnId) || [];
    const task = sourceTasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask: Task = { 
      ...task, 
      columnId: targetColumnId, 
      order: newIndex, 
      updatedAt: Date.now() 
    };

    // Update source column tasks
    const newSourceTasks = sourceTasks
      .filter(t => t.id !== taskId)
      .map((t, idx) => ({ ...t, order: idx }));

    // Update target column tasks
    let newTargetTasks: Task[];
    if (sourceColumnId === targetColumnId) {
      newTargetTasks = [...newSourceTasks];
      newTargetTasks.splice(newIndex, 0, updatedTask);
      newTargetTasks = newTargetTasks.map((t, idx) => ({ ...t, order: idx }));
    } else {
      const targetTasks = tasks.get(targetColumnId) || [];
      newTargetTasks = [...targetTasks];
      newTargetTasks.splice(newIndex, 0, updatedTask);
      newTargetTasks = newTargetTasks.map((t, idx) => ({ ...t, order: idx }));
    }

    // Save all affected tasks
    for (const t of newSourceTasks) {
      await db.saveTask(t);
    }
    for (const t of newTargetTasks) {
      await db.saveTask(t);
    }

    setTasks(prev => {
      const next = new Map(prev);
      if (sourceColumnId === targetColumnId) {
        next.set(sourceColumnId, newTargetTasks);
      } else {
        next.set(sourceColumnId, newSourceTasks);
        next.set(targetColumnId, newTargetTasks);
      }
      return next;
    });
  }, [tasks]);

  // Label operations
  const createLabel = useCallback(async (name: string, color: string) => {
    if (!currentBoard) return;

    const label: Label = {
      id: uuidv4(),
      name,
      color,
      boardId: currentBoard.id,
    };
    await db.saveLabel(label);
    setLabels(prev => [...prev, label]);
    return label;
  }, [currentBoard]);

  const updateLabel = useCallback(async (id: string, updates: Partial<Pick<Label, 'name' | 'color'>>) => {
    const label = labels.find(l => l.id === id);
    if (!label) return;

    const updated: Label = { ...label, ...updates };
    await db.saveLabel(updated);
    setLabels(prev => prev.map(l => l.id === id ? updated : l));
  }, [labels]);

  const deleteLabel = useCallback(async (id: string) => {
    await db.deleteLabel(id);
    setLabels(prev => prev.filter(l => l.id !== id));

    // Remove label from all tasks
    setTasks(prev => {
      const next = new Map(prev);
      const entries = Array.from(next.entries());
      for (const [columnId, columnTasks] of entries) {
        const updated = columnTasks.map((task: Task) => ({
          ...task,
          labelIds: task.labelIds.filter((labelId: string) => labelId !== id),
        }));
        // Save updated tasks
        updated.forEach((task: Task) => {
          const original = columnTasks.find((t: Task) => t.id === task.id);
          if (original && task.labelIds.length !== original.labelIds.length) {
            db.saveTask(task);
          }
        });
        next.set(columnId, updated);
      }
      return next;
    });
  }, []);

  // Export/Import operations
  const exportData = useCallback(async () => {
    const data = await db.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data: KanbanData = JSON.parse(text);
      
      // Validate data structure
      if (!data.boards || !data.columns || !data.tasks) {
        throw new Error('Invalid data format');
      }
      
      await db.importData(data);
      await loadBoards();
      
      if (data.boards.length > 0) {
        setCurrentBoard(data.boards[0]);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }, []);

  return {
    // State
    boards,
    currentBoard,
    columns,
    tasks,
    labels,
    loading,
    
    // Board operations
    setCurrentBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    
    // Column operations
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    
    // Task operations
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    
    // Label operations
    createLabel,
    updateLabel,
    deleteLabel,
    
    // Export/Import
    exportData,
    importData,
  };
}

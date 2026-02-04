import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Board, Column, Task, Label, KanbanData, BoardTemplate, TaskPriority } from '../types';

interface KanbanDB extends DBSchema {
  boards: {
    key: string;
    value: Board;
    indexes: { 'by-created': number };
  };
  columns: {
    key: string;
    value: Column;
    indexes: { 'by-board': string; 'by-order': number };
  };
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-column': string; 'by-order': number };
  };
  labels: {
    key: string;
    value: Label;
    indexes: { 'by-board': string };
  };
  templates: {
    key: string;
    value: BoardTemplate;
    indexes: { 'by-created': number };
  };
}

const DB_NAME = 'kanban-db';
const DB_VERSION = 6;

let dbInstance: IDBPDatabase<KanbanDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<KanbanDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<KanbanDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Boards store
      if (!db.objectStoreNames.contains('boards')) {
        const boardStore = db.createObjectStore('boards', { keyPath: 'id' });
        boardStore.createIndex('by-created', 'createdAt');
      }

      // Columns store
      if (!db.objectStoreNames.contains('columns')) {
        const columnStore = db.createObjectStore('columns', { keyPath: 'id' });
        columnStore.createIndex('by-board', 'boardId');
        columnStore.createIndex('by-order', 'order');
      }

      // Tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-column', 'columnId');
        taskStore.createIndex('by-order', 'order');
      }

      // Labels store (added in version 2)
      if (!db.objectStoreNames.contains('labels')) {
        const labelStore = db.createObjectStore('labels', { keyPath: 'id' });
        labelStore.createIndex('by-board', 'boardId');
      }

      // Templates store (added in version 4)
      if (!db.objectStoreNames.contains('templates')) {
        const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
        templateStore.createIndex('by-created', 'createdAt');
      }

      // Migration for subtasks (version 5)
      if (oldVersion < 5) {
        // Note: Migration of existing tasks to add empty subtasks array
        // is handled in getTasksByColumn and saveTask functions
      }
    },
  });

  return dbInstance;
}

// Board operations
export async function getAllBoards(): Promise<Board[]> {
  const db = await getDB();
  return db.getAllFromIndex('boards', 'by-created');
}

export async function getBoard(id: string): Promise<Board | undefined> {
  const db = await getDB();
  return db.get('boards', id);
}

export async function saveBoard(board: Board): Promise<void> {
  const db = await getDB();
  await db.put('boards', board);
}

export async function deleteBoard(id: string): Promise<void> {
  const db = await getDB();
  
  // Delete all columns and tasks for this board
  const columns = await getColumnsByBoard(id);
  for (const column of columns) {
    await deleteColumn(column.id);
  }
  
  // Delete all labels for this board
  const labels = await getLabelsByBoard(id);
  for (const label of labels) {
    await db.delete('labels', label.id);
  }
  
  await db.delete('boards', id);
}

// Column operations
export async function getColumnsByBoard(boardId: string): Promise<Column[]> {
  const db = await getDB();
  const columns = await db.getAllFromIndex('columns', 'by-board', boardId);
  return columns.sort((a, b) => a.order - b.order);
}

export async function saveColumn(column: Column): Promise<void> {
  const db = await getDB();
  await db.put('columns', column);
}

export async function deleteColumn(id: string): Promise<void> {
  const db = await getDB();
  
  // Delete all tasks in this column
  const tasks = await getTasksByColumn(id);
  for (const task of tasks) {
    await db.delete('tasks', task.id);
  }
  
  await db.delete('columns', id);
}

// Task operations
export async function getTasksByColumn(columnId: string): Promise<Task[]> {
  const db = await getDB();
  const tasks = await db.getAllFromIndex('tasks', 'by-column', columnId);
  // Ensure labelIds and subtasks exist for backward compatibility
  // Ensure labelIds, subtasks and priority exist for backward compatibility
  return tasks
    .map(task => ({ 
      ...task, 
      labelIds: task.labelIds || [],
      subtasks: task.subtasks || [],
      priority: (task.priority || 'none') as TaskPriority,
    }))
    .sort((a, b) => a.order - b.order);
}

export async function saveTask(task: Task): Promise<void> {
  const db = await getDB();
  // Ensure labelIds and subtasks are always arrays
  // Ensure labelIds, subtasks and priority are always set
  await db.put('tasks', { 
    ...task, 
    labelIds: task.labelIds || [],
    subtasks: task.subtasks || [],
    priority: (task.priority || 'none') as TaskPriority,
  });
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

// Label operations
export async function getLabelsByBoard(boardId: string): Promise<Label[]> {
  const db = await getDB();
  return db.getAllFromIndex('labels', 'by-board', boardId);
}

export async function saveLabel(label: Label): Promise<void> {
  const db = await getDB();
  await db.put('labels', label);
}

export async function deleteLabel(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('labels', id);
}

// Export/Import operations
export async function exportData(): Promise<KanbanData> {
  const db = await getDB();
  
  const boards = await db.getAll('boards');
  const columns = await db.getAll('columns');
  const tasks = await db.getAll('tasks');
  const labels = await db.getAll('labels');
  
  return {
    boards,
    columns,
    tasks,
    labels,
    exportedAt: Date.now(),
    version: '1.7.0',
  };
}

export async function importData(data: KanbanData): Promise<void> {
  const db = await getDB();
  
  // Clear existing data
  await db.clear('tasks');
  await db.clear('columns');
  await db.clear('boards');
  await db.clear('labels');
  
  // Import new data
  const tx = db.transaction(['boards', 'columns', 'tasks', 'labels'], 'readwrite');
  
  for (const board of data.boards) {
    await tx.objectStore('boards').put(board);
  }
  
  for (const column of data.columns) {
    await tx.objectStore('columns').put(column);
  }
  
  for (const task of data.tasks) {
    // Ensure labelIds and subtasks exist for backward compatibility
    // Ensure labelIds, subtasks and priority exist for backward compatibility
    await tx.objectStore('tasks').put({ 
      ...task, 
      labelIds: task.labelIds || [],
      subtasks: task.subtasks || [],
      priority: (task.priority || 'none') as TaskPriority,
    });
  }
  // Import labels if they exist (backward compatibility)
  if (data.labels) {
    for (const label of data.labels) {
      await tx.objectStore('labels').put(label);
    }
  }
  
  await tx.done;
}

// Template operations
export async function getAllTemplates(): Promise<BoardTemplate[]> {
  const db = await getDB();
  return db.getAllFromIndex('templates', 'by-created');
}

export async function getTemplate(id: string): Promise<BoardTemplate | undefined> {
  const db = await getDB();
  return db.get('templates', id);
}

export async function saveTemplate(template: BoardTemplate): Promise<void> {
  const db = await getDB();
  await db.put('templates', template);
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('templates', id);
}

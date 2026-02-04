import {
  getDB,
  resetDB,
  getAllBoards,
  getBoard,
  saveBoard,
  deleteBoard,
  getColumnsByBoard,
  saveColumn,
  deleteColumn,
  getTasksByColumn,
  saveTask,
  deleteTask,
  getLabelsByBoard,
  saveLabel,
  deleteLabel,
  exportData,
  importData,
  getAllTemplates,
  getTemplate,
  saveTemplate,
  deleteTemplate,
} from '../db';
import { Board, Column, Task, Label, BoardTemplate } from '../../types';

// Helper functions to create test data
const createTestBoard = (id: string, title: string = 'Test Board'): Board => ({
  id,
  title,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const createTestColumn = (id: string, boardId: string, order: number = 0): Column => ({
  id,
  title: `Column ${id}`,
  boardId,
  order,
});

const createTestTask = (id: string, columnId: string, order: number = 0): Task => ({
  id,
  title: `Task ${id}`,
  columnId,
  order,
  labelIds: [],
  subtasks: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  priority: 'none',
  comments: [],
  attachments: [],
});

const createTestLabel = (id: string, boardId: string): Label => ({
  id,
  name: `Label ${id}`,
  color: '#ff0000',
  boardId,
});

const createTestTemplate = (id: string): BoardTemplate => ({
  id,
  name: `Template ${id}`,
  description: 'Test template',
  icon: '📋',
  isBuiltIn: false,
  columns: [{ title: 'Column 1' }],
  labels: [{ name: 'Label', color: '#ff0000' }],
  tasks: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

describe('Database Operations', () => {
  // Reset database before each test to ensure clean state
  beforeEach(async () => {
    await resetDB();
  });

  // Clean up after all tests
  afterAll(async () => {
    await resetDB();
  });

  describe('Board Operations', () => {
    describe('saveBoard & getBoard', () => {
      it('should save and retrieve a board', async () => {
        const board = createTestBoard('board-1', 'My Board');
        
        await saveBoard(board);
        const retrieved = await getBoard('board-1');
        
        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe('board-1');
        expect(retrieved?.title).toBe('My Board');
      });

      it('should return undefined for non-existent board', async () => {
        const result = await getBoard('non-existent');
        expect(result).toBeUndefined();
      });
    });

    describe('getAllBoards', () => {
      it('should return all boards', async () => {
        await saveBoard(createTestBoard('board-1'));
        await saveBoard(createTestBoard('board-2'));
        await saveBoard(createTestBoard('board-3'));
        
        const boards = await getAllBoards();
        
        expect(boards).toHaveLength(3);
      });

      it('should return empty array when no boards exist', async () => {
        const boards = await getAllBoards();
        expect(boards).toHaveLength(0);
      });
    });

    describe('deleteBoard', () => {
      it('should delete board and its columns/tasks/labels', async () => {
        const board = createTestBoard('board-1');
        const column = createTestColumn('col-1', 'board-1');
        const task = createTestTask('task-1', 'col-1');
        const label = createTestLabel('label-1', 'board-1');
        
        await saveBoard(board);
        await saveColumn(column);
        await saveTask(task);
        await saveLabel(label);
        
        await deleteBoard('board-1');
        
        expect(await getBoard('board-1')).toBeUndefined();
        expect(await getColumnsByBoard('board-1')).toHaveLength(0);
        expect(await getLabelsByBoard('board-1')).toHaveLength(0);
      });
    });
  });

  describe('Column Operations', () => {
    describe('saveColumn & getColumnsByBoard', () => {
      it('should save and retrieve columns', async () => {
        const board = createTestBoard('board-1');
        await saveBoard(board);
        
        await saveColumn(createTestColumn('col-1', 'board-1', 0));
        await saveColumn(createTestColumn('col-2', 'board-1', 1));
        
        const columns = await getColumnsByBoard('board-1');
        
        expect(columns).toHaveLength(2);
        expect(columns[0].order).toBe(0);
        expect(columns[1].order).toBe(1);
      });

      it('should return columns sorted by order', async () => {
        const board = createTestBoard('board-1');
        await saveBoard(board);
        
        // Save in wrong order
        await saveColumn(createTestColumn('col-2', 'board-1', 2));
        await saveColumn(createTestColumn('col-1', 'board-1', 0));
        await saveColumn(createTestColumn('col-3', 'board-1', 1));
        
        const columns = await getColumnsByBoard('board-1');
        
        expect(columns[0].id).toBe('col-1');
        expect(columns[1].id).toBe('col-3');
        expect(columns[2].id).toBe('col-2');
      });
    });

    describe('deleteColumn', () => {
      it('should delete column and its tasks', async () => {
        await saveBoard(createTestBoard('board-1'));
        await saveColumn(createTestColumn('col-1', 'board-1'));
        await saveTask(createTestTask('task-1', 'col-1'));
        await saveTask(createTestTask('task-2', 'col-1'));
        
        await deleteColumn('col-1');
        
        const columns = await getColumnsByBoard('board-1');
        const tasks = await getTasksByColumn('col-1');
        
        expect(columns).toHaveLength(0);
        expect(tasks).toHaveLength(0);
      });
    });
  });

  describe('Task Operations', () => {
    describe('saveTask & getTasksByColumn', () => {
      it('should save and retrieve tasks', async () => {
        await saveBoard(createTestBoard('board-1'));
        await saveColumn(createTestColumn('col-1', 'board-1'));
        
        await saveTask(createTestTask('task-1', 'col-1', 0));
        await saveTask(createTestTask('task-2', 'col-1', 1));
        
        const tasks = await getTasksByColumn('col-1');
        
        expect(tasks).toHaveLength(2);
      });

      it('should ensure all fields exist for backward compatibility', async () => {
        await saveBoard(createTestBoard('board-1'));
        await saveColumn(createTestColumn('col-1', 'board-1'));
        
        // Save a minimal task
        const minimalTask: any = {
          id: 'task-1',
          title: 'Minimal Task',
          columnId: 'col-1',
          order: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          // Missing: labelIds, subtasks, comments, attachments, priority
        };
        
        const db = await getDB();
        await db.put('tasks', minimalTask);
        
        const tasks = await getTasksByColumn('col-1');
        
        expect(tasks[0].labelIds).toEqual([]);
        expect(tasks[0].subtasks).toEqual([]);
        expect(tasks[0].comments).toEqual([]);
        expect(tasks[0].attachments).toEqual([]);
        expect(tasks[0].priority).toBe('none');
      });
    });

    describe('deleteTask', () => {
      it('should delete a single task', async () => {
        await saveBoard(createTestBoard('board-1'));
        await saveColumn(createTestColumn('col-1', 'board-1'));
        await saveTask(createTestTask('task-1', 'col-1'));
        await saveTask(createTestTask('task-2', 'col-1'));
        
        await deleteTask('task-1');
        
        const tasks = await getTasksByColumn('col-1');
        
        expect(tasks).toHaveLength(1);
        expect(tasks[0].id).toBe('task-2');
      });
    });
  });

  describe('Label Operations', () => {
    describe('saveLabel & getLabelsByBoard', () => {
      it('should save and retrieve labels', async () => {
        await saveBoard(createTestBoard('board-1'));
        
        await saveLabel(createTestLabel('label-1', 'board-1'));
        await saveLabel(createTestLabel('label-2', 'board-1'));
        
        const labels = await getLabelsByBoard('board-1');
        
        expect(labels).toHaveLength(2);
      });
    });

    describe('deleteLabel', () => {
      it('should delete a label', async () => {
        await saveBoard(createTestBoard('board-1'));
        await saveLabel(createTestLabel('label-1', 'board-1'));
        
        await deleteLabel('label-1');
        
        const labels = await getLabelsByBoard('board-1');
        expect(labels).toHaveLength(0);
      });
    });
  });

  describe('Export/Import Operations', () => {
    describe('exportData', () => {
      it('should export all data', async () => {
        await saveBoard(createTestBoard('board-1'));
        await saveColumn(createTestColumn('col-1', 'board-1'));
        await saveTask(createTestTask('task-1', 'col-1'));
        await saveLabel(createTestLabel('label-1', 'board-1'));
        
        const data = await exportData();
        
        expect(data.boards).toHaveLength(1);
        expect(data.columns).toHaveLength(1);
        expect(data.tasks).toHaveLength(1);
        expect(data.labels).toHaveLength(1);
        expect(data.version).toBe('2.1.0');
        expect(data.exportedAt).toBeDefined();
      });
    });

    describe('importData', () => {
      it('should import data and clear existing', async () => {
        // Add existing data
        await saveBoard(createTestBoard('old-board'));
        
        // Import new data
        const importedData = {
          boards: [createTestBoard('new-board')],
          columns: [createTestColumn('new-col', 'new-board')],
          tasks: [createTestTask('new-task', 'new-col')],
          labels: [createTestLabel('new-label', 'new-board')],
          exportedAt: Date.now(),
          version: '2.1.0',
        };
        
        await importData(importedData);
        
        const boards = await getAllBoards();
        expect(boards).toHaveLength(1);
        expect(boards[0].id).toBe('new-board');
      });

      it('should handle import without labels (backward compatibility)', async () => {
        const importedData = {
          boards: [createTestBoard('board-1')],
          columns: [],
          tasks: [],
          labels: undefined as any, // Missing labels
          exportedAt: Date.now(),
          version: '1.0.0',
        };
        
        await importData(importedData);
        
        const boards = await getAllBoards();
        expect(boards).toHaveLength(1);
      });
    });
  });

  describe('Template Operations', () => {
    describe('saveTemplate & getTemplate', () => {
      it('should save and retrieve a template', async () => {
        const template = createTestTemplate('tpl-1');
        
        await saveTemplate(template);
        const retrieved = await getTemplate('tpl-1');
        
        expect(retrieved).toBeDefined();
        expect(retrieved?.name).toBe('Template tpl-1');
      });
    });

    describe('getAllTemplates', () => {
      it('should return all templates', async () => {
        await saveTemplate(createTestTemplate('tpl-1'));
        await saveTemplate(createTestTemplate('tpl-2'));
        
        const templates = await getAllTemplates();
        
        expect(templates).toHaveLength(2);
      });
    });

    describe('deleteTemplate', () => {
      it('should delete a template', async () => {
        await saveTemplate(createTestTemplate('tpl-1'));
        
        await deleteTemplate('tpl-1');
        
        const template = await getTemplate('tpl-1');
        expect(template).toBeUndefined();
      });
    });
  });
});

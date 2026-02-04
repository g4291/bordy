export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  labelIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  order: number;
  color?: string;
}

export interface Board {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface KanbanData {
  boards: Board[];
  columns: Column[];
  tasks: Task[];
  labels: Label[];
  exportedAt: number;
  version: string;
}

// Predefined label colors
export const LABEL_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
] as const;

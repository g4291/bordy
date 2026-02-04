export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'critical';

export const PRIORITY_CONFIG = {
  none:     { label: 'None',     color: '#6b7280', bgClass: 'bg-gray-100 dark:bg-gray-800', textClass: 'text-gray-600 dark:text-gray-400', borderClass: '', order: 0 },
  low:      { label: 'Low',      color: '#22c55e', bgClass: 'bg-green-100 dark:bg-green-900/30', textClass: 'text-green-600 dark:text-green-400', borderClass: 'border-l-4 border-l-green-500', order: 1 },
  medium:   { label: 'Medium',   color: '#eab308', bgClass: 'bg-yellow-100 dark:bg-yellow-900/30', textClass: 'text-yellow-600 dark:text-yellow-400', borderClass: 'border-l-4 border-l-yellow-500', order: 2 },
  high:     { label: 'High',     color: '#f97316', bgClass: 'bg-orange-100 dark:bg-orange-900/30', textClass: 'text-orange-600 dark:text-orange-400', borderClass: 'border-l-4 border-l-orange-500', order: 3 },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-100 dark:bg-red-900/30', textClass: 'text-red-600 dark:text-red-400', borderClass: 'border-l-4 border-l-red-500', order: 4 },
} as const;


export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: number;
  updatedAt?: number;  // timestamp when edited
}

// ==========================================
// Attachment Types (v2.1.0)
// ==========================================

export interface Attachment {
  id: string;
  name: string;           // original filename
  type: string;           // MIME type (image/png, application/pdf, etc.)
  size: number;           // size in bytes
  data: string;           // base64 encoded data
  createdAt: number;
  thumbnail?: string;     // base64 thumbnail for images (smaller preview)
}

// Attachment constants
export const ATTACHMENT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024,  // 10 MB
  maxThumbnailSize: 200,          // 200px max dimension for thumbnails
  thumbnailQuality: 0.7,          // JPEG quality for thumbnails
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
} as const;

// Helper to check if file is an image
export const isImageType = (mimeType: string): boolean => {
  return ATTACHMENT_CONFIG.supportedImageTypes.includes(mimeType as any) || mimeType.startsWith('image/');
};

// Helper to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Helper to get file extension
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

// Helper to get icon for file type
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return '📦';
  if (mimeType.includes('text/')) return '📃';
  return '📎';
};

// ==========================================
// Task Completion (v2.2.0)
// ==========================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  labelIds: string[];
  dueDate?: number;
  subtasks: Subtask[];
  createdAt: number;
  updatedAt: number;
  priority: TaskPriority;
  comments: Comment[];
  attachments: Attachment[];  // Added in v2.1.0
  completed: boolean;       // Whether task is marked as complete
  completedAt?: number;     // Timestamp when task was completed
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  order: number;
  color?: string;
  isCompleteColumn?: boolean;  // Tasks moved to this column are auto-marked complete
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

// Predefined column colors
export const COLUMN_COLORS = [
  { name: 'None', value: '' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Gray', value: '#6b7280' },
] as const;

export interface TemplateTask {
  title: string;
  description?: string;
  columnIndex: number;  // reference to column by index
  labelIndices: number[];  // reference to labels by index
  priority?: TaskPriority;  // optional priority for template tasks
}

export interface TemplateColumn {
  title: string;
  color?: string;
  isCompleteColumn?: boolean;  // Tasks in this column are auto-marked complete
}


export interface TemplateLabel {
  name: string;
  color: string;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;  // emoji
  isBuiltIn: boolean;
  columns: TemplateColumn[];
  labels: TemplateLabel[];
  tasks: TemplateTask[];
  createdAt: number;
  updatedAt: number;
}

// ==========================================
// View Mode Types (v1.8.0 - Calendar/Agenda)
// ==========================================

export type ViewMode = 'kanban' | 'calendar' | 'agenda';
export type CalendarMode = 'month' | 'week';

export interface CalendarDay {
  date: Date;
  dateKey: string;        // 'YYYY-MM-DD' for easy comparison
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  tasks: Task[];
}

export interface AgendaGroup {
  key: string;            // 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'later' | 'no-date' | date string
  label: string;          // Display label
  tasks: Task[];
  isCollapsible: boolean;
  defaultCollapsed: boolean;
}

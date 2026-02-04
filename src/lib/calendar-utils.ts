import { Task, CalendarDay } from '../types';

// ==========================================
// Date Formatting Utilities
// ==========================================

/**
 * Format date as 'YYYY-MM-DD' for consistent comparison
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse 'YYYY-MM-DD' string to Date object
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get start of day (midnight)
 */
export function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Get end of day (23:59:59.999)
 */
export function getEndOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

// ==========================================
// Date Comparison Utilities
// ==========================================

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if date is in the past (before today)
 */
export function isPast(date: Date): boolean {
  const today = getStartOfDay(new Date());
  const compareDate = getStartOfDay(date);
  return compareDate.getTime() < today.getTime();
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

/**
 * Check if date is within this week (from today to end of week)
 */
export function isThisWeek(date: Date): boolean {
  const today = getStartOfDay(new Date());
  const compareDate = getStartOfDay(date);
  
  // Get end of this week (Sunday)
  const endOfWeek = new Date(today);
  const daysUntilSunday = 7 - today.getDay();
  endOfWeek.setDate(today.getDate() + daysUntilSunday);
  
  return compareDate.getTime() >= today.getTime() && 
         compareDate.getTime() <= endOfWeek.getTime();
}

/**
 * Check if date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// ==========================================
// Calendar Generation Utilities
// ==========================================

/**
 * Get the first day of a month
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Get the last day of a month
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/**
 * Get number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get week number of the year
 */
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Get the Monday of the week containing the given date
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the Sunday of the week containing the given date
 */
export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

/**
 * Generate array of days for month view (includes days from prev/next month to fill grid)
 */
export function getMonthViewDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = getFirstDayOfMonth(year, month);
  const lastDay = getLastDayOfMonth(year, month);
  
  // Get the Monday before or on the first day
  const startDate = getStartOfWeek(firstDay);
  
  // Generate 6 weeks (42 days) to ensure we cover all cases
  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  
  return days;
}

/**
 * Generate array of days for week view
 */
export function getWeekViewDays(date: Date): Date[] {
  const days: Date[] = [];
  const startOfWeek = getStartOfWeek(date);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  
  return days;
}

// ==========================================
// Task Grouping Utilities
// ==========================================

/**
 * Group tasks by their due date
 */
export function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
  const grouped = new Map<string, Task[]>();
  
  tasks.forEach(task => {
    if (task.dueDate) {
      const dateKey = formatDateKey(new Date(task.dueDate));
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, task]);
    }
  });
  
  return grouped;
}

/**
 * Get tasks for a specific date
 */
export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  const dateKey = formatDateKey(date);
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    return formatDateKey(new Date(task.dueDate)) === dateKey;
  });
}

/**
 * Get tasks without a due date
 */
export function getTasksWithoutDate(tasks: Task[]): Task[] {
  return tasks.filter(task => !task.dueDate);
}

/**
 * Get overdue tasks
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = getStartOfDay(new Date());
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate).getTime() < today.getTime();
  });
}

/**
 * Build CalendarDay objects for a given month
 */
export function buildCalendarDays(
  year: number, 
  month: number, 
  tasks: Task[]
): CalendarDay[] {
  const dates = getMonthViewDays(year, month);
  const tasksByDate = groupTasksByDate(tasks);
  const today = new Date();
  
  return dates.map(date => ({
    date,
    dateKey: formatDateKey(date),
    isCurrentMonth: date.getMonth() === month,
    isToday: isSameDay(date, today),
    isWeekend: isWeekend(date),
    tasks: tasksByDate.get(formatDateKey(date)) || [],
  }));
}

/**
 * Build CalendarDay objects for a given week
 */
export function buildWeekDays(
  date: Date,
  tasks: Task[]
): CalendarDay[] {
  const dates = getWeekViewDays(date);
  const tasksByDate = groupTasksByDate(tasks);
  const today = new Date();
  const currentMonth = date.getMonth();
  
  return dates.map(d => ({
    date: d,
    dateKey: formatDateKey(d),
    isCurrentMonth: d.getMonth() === currentMonth,
    isToday: isSameDay(d, today),
    isWeekend: isWeekend(d),
    tasks: tasksByDate.get(formatDateKey(d)) || [],
  }));
}

// ==========================================
// Display Formatting
// ==========================================

/**
 * Format month display title (e.g., "February 2026")
 */
export function formatMonthTitle(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Format week display title (e.g., "Week 6, Feb 3-9, 2026")
 */
export function formatWeekTitle(date: Date): string {
  const weekNum = getWeekNumber(date);
  const start = getStartOfWeek(date);
  const end = getEndOfWeek(date);
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return `Week ${weekNum}, ${startStr} - ${endStr}`;
}

/**
 * Format day header (e.g., "Mon", "Tue")
 */
export function formatDayHeader(dayIndex: number): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days[dayIndex];
}

/**
 * Format date for agenda (e.g., "Tuesday, February 4")
 */
export function formatAgendaDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Format relative date (e.g., "Today", "Tomorrow", "Feb 4")
 */
export function formatRelativeDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

import {
  formatDateKey,
  parseDateKey,
  getStartOfDay,
  getEndOfDay,
  isSameDay,
  isToday,
  isPast,
  isTomorrow,
  isWeekend,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getDaysInMonth,
  getWeekNumber,
  getStartOfWeek,
  getEndOfWeek,
  getMonthViewDays,
  getWeekViewDays,
  groupTasksByDate,
  getTasksForDate,
  getTasksWithoutDate,
  getOverdueTasks,
  formatMonthTitle,
  formatWeekTitle,
  formatDayHeader,
  formatRelativeDate,
} from '../calendar-utils';
import { Task } from '../../types';

// Helper to create mock tasks
const createMockTask = (id: string, dueDate?: number): Task => ({
  id,
  title: `Task ${id}`,
  columnId: 'col-1',
  order: 0,
  labelIds: [],
  subtasks: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  priority: 'none',
  comments: [],
  attachments: [],
  dueDate,
});

describe('Calendar Utils', () => {
  describe('Date Formatting', () => {
    describe('formatDateKey', () => {
      it('should format date as YYYY-MM-DD', () => {
        const date = new Date(2026, 1, 4); // Feb 4, 2026
        expect(formatDateKey(date)).toBe('2026-02-04');
      });

      it('should pad month and day with zeros', () => {
        const date = new Date(2026, 0, 5); // Jan 5, 2026
        expect(formatDateKey(date)).toBe('2026-01-05');
      });
    });

    describe('parseDateKey', () => {
      it('should parse YYYY-MM-DD string to Date', () => {
        const date = parseDateKey('2026-02-04');
        expect(date.getFullYear()).toBe(2026);
        expect(date.getMonth()).toBe(1); // 0-indexed
        expect(date.getDate()).toBe(4);
      });
    });

    describe('getStartOfDay', () => {
      it('should return midnight of the given date', () => {
        const date = new Date(2026, 1, 4, 15, 30, 45);
        const startOfDay = getStartOfDay(date);
        
        expect(startOfDay.getHours()).toBe(0);
        expect(startOfDay.getMinutes()).toBe(0);
        expect(startOfDay.getSeconds()).toBe(0);
        expect(startOfDay.getDate()).toBe(4);
      });
    });

    describe('getEndOfDay', () => {
      it('should return 23:59:59.999 of the given date', () => {
        const date = new Date(2026, 1, 4, 10, 0, 0);
        const endOfDay = getEndOfDay(date);
        
        expect(endOfDay.getHours()).toBe(23);
        expect(endOfDay.getMinutes()).toBe(59);
        expect(endOfDay.getSeconds()).toBe(59);
        expect(endOfDay.getMilliseconds()).toBe(999);
      });
    });
  });

  describe('Date Comparison', () => {
    describe('isSameDay', () => {
      it('should return true for same day', () => {
        const date1 = new Date(2026, 1, 4, 10, 0);
        const date2 = new Date(2026, 1, 4, 18, 30);
        expect(isSameDay(date1, date2)).toBe(true);
      });

      it('should return false for different days', () => {
        const date1 = new Date(2026, 1, 4);
        const date2 = new Date(2026, 1, 5);
        expect(isSameDay(date1, date2)).toBe(false);
      });
    });

    describe('isToday', () => {
      it('should return true for today', () => {
        const today = new Date();
        expect(isToday(today)).toBe(true);
      });

      it('should return false for other days', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(isToday(yesterday)).toBe(false);
      });
    });

    describe('isPast', () => {
      it('should return true for past dates', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        expect(isPast(pastDate)).toBe(true);
      });

      it('should return false for today', () => {
        const today = new Date();
        expect(isPast(today)).toBe(false);
      });

      it('should return false for future dates', () => {
        const future = new Date();
        future.setDate(future.getDate() + 1);
        expect(isPast(future)).toBe(false);
      });
    });

    describe('isTomorrow', () => {
      it('should return true for tomorrow', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        expect(isTomorrow(tomorrow)).toBe(true);
      });

      it('should return false for today', () => {
        expect(isTomorrow(new Date())).toBe(false);
      });
    });

    describe('isWeekend', () => {
      it('should return true for Saturday', () => {
        const saturday = new Date(2026, 1, 7); // Feb 7, 2026 is Saturday
        expect(isWeekend(saturday)).toBe(true);
      });

      it('should return true for Sunday', () => {
        const sunday = new Date(2026, 1, 8); // Feb 8, 2026 is Sunday
        expect(isWeekend(sunday)).toBe(true);
      });

      it('should return false for weekdays', () => {
        const monday = new Date(2026, 1, 9); // Feb 9, 2026 is Monday
        expect(isWeekend(monday)).toBe(false);
      });
    });
  });

  describe('Calendar Generation', () => {
    describe('getFirstDayOfMonth', () => {
      it('should return the first day of the month', () => {
        const firstDay = getFirstDayOfMonth(2026, 1); // February 2026
        expect(firstDay.getDate()).toBe(1);
        expect(firstDay.getMonth()).toBe(1);
      });
    });

    describe('getLastDayOfMonth', () => {
      it('should return the last day of February (non-leap year)', () => {
        const lastDay = getLastDayOfMonth(2026, 1);
        expect(lastDay.getDate()).toBe(28);
      });

      it('should return the last day of January', () => {
        const lastDay = getLastDayOfMonth(2026, 0);
        expect(lastDay.getDate()).toBe(31);
      });
    });

    describe('getDaysInMonth', () => {
      it('should return correct number of days', () => {
        expect(getDaysInMonth(2026, 0)).toBe(31); // January
        expect(getDaysInMonth(2026, 1)).toBe(28); // February
        expect(getDaysInMonth(2026, 3)).toBe(30); // April
      });

      it('should handle leap years', () => {
        expect(getDaysInMonth(2024, 1)).toBe(29); // February 2024
      });
    });

    describe('getWeekNumber', () => {
      it('should return correct week number', () => {
        const date = new Date(2026, 0, 1); // Jan 1, 2026
        expect(getWeekNumber(date)).toBeGreaterThan(0);
      });
    });

    describe('getStartOfWeek', () => {
      it('should return Monday', () => {
        const wednesday = new Date(2026, 1, 4); // Feb 4, 2026 is Wednesday
        const monday = getStartOfWeek(wednesday);
        expect(monday.getDay()).toBe(1); // Monday = 1
        expect(monday.getDate()).toBe(2); // Feb 2, 2026
      });
    });

    describe('getEndOfWeek', () => {
      it('should return Sunday', () => {
        const wednesday = new Date(2026, 1, 4);
        const sunday = getEndOfWeek(wednesday);
        expect(sunday.getDay()).toBe(0); // Sunday = 0
        expect(sunday.getDate()).toBe(8); // Feb 8, 2026
      });
    });

    describe('getMonthViewDays', () => {
      it('should return 42 days (6 weeks)', () => {
        const days = getMonthViewDays(2026, 1);
        expect(days).toHaveLength(42);
      });

      it('should start from Monday', () => {
        const days = getMonthViewDays(2026, 1);
        expect(days[0].getDay()).toBe(1); // Monday
      });
    });

    describe('getWeekViewDays', () => {
      it('should return 7 days', () => {
        const days = getWeekViewDays(new Date(2026, 1, 4));
        expect(days).toHaveLength(7);
      });

      it('should start from Monday', () => {
        const days = getWeekViewDays(new Date(2026, 1, 4));
        expect(days[0].getDay()).toBe(1); // Monday
      });
    });
  });

  describe('Task Grouping', () => {
    describe('groupTasksByDate', () => {
      it('should group tasks by their due date', () => {
        const tasks = [
          createMockTask('1', new Date(2026, 1, 4).getTime()),
          createMockTask('2', new Date(2026, 1, 4).getTime()),
          createMockTask('3', new Date(2026, 1, 5).getTime()),
        ];

        const grouped = groupTasksByDate(tasks);
        
        expect(grouped.get('2026-02-04')).toHaveLength(2);
        expect(grouped.get('2026-02-05')).toHaveLength(1);
      });

      it('should ignore tasks without due date', () => {
        const tasks = [
          createMockTask('1', new Date(2026, 1, 4).getTime()),
          createMockTask('2'), // no due date
        ];

        const grouped = groupTasksByDate(tasks);
        
        expect(grouped.size).toBe(1);
      });
    });

    describe('getTasksForDate', () => {
      it('should return tasks for specific date', () => {
        const targetDate = new Date(2026, 1, 4);
        const tasks = [
          createMockTask('1', targetDate.getTime()),
          createMockTask('2', new Date(2026, 1, 5).getTime()),
        ];

        const result = getTasksForDate(tasks, targetDate);
        
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
      });
    });

    describe('getTasksWithoutDate', () => {
      it('should return tasks without due date', () => {
        const tasks = [
          createMockTask('1', new Date(2026, 1, 4).getTime()),
          createMockTask('2'),
          createMockTask('3'),
        ];

        const result = getTasksWithoutDate(tasks);
        
        expect(result).toHaveLength(2);
      });
    });

    describe('getOverdueTasks', () => {
      it('should return overdue tasks', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5);
        
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);

        const tasks = [
          createMockTask('1', pastDate.getTime()),
          createMockTask('2', futureDate.getTime()),
        ];

        const result = getOverdueTasks(tasks);
        
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
      });
    });
  });

  describe('Display Formatting', () => {
    describe('formatMonthTitle', () => {
      it('should format month title correctly', () => {
        const title = formatMonthTitle(2026, 1);
        expect(title).toBe('February 2026');
      });
    });

    describe('formatWeekTitle', () => {
      it('should include week number and date range', () => {
        const title = formatWeekTitle(new Date(2026, 1, 4));
        expect(title).toContain('Week');
        expect(title).toContain('Feb');
      });
    });

    describe('formatDayHeader', () => {
      it('should return correct day abbreviations', () => {
        expect(formatDayHeader(0)).toBe('Mon');
        expect(formatDayHeader(6)).toBe('Sun');
      });
    });

    describe('formatRelativeDate', () => {
      it('should return "Today" for today', () => {
        expect(formatRelativeDate(new Date())).toBe('Today');
      });

      it('should return "Tomorrow" for tomorrow', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        expect(formatRelativeDate(tomorrow)).toBe('Tomorrow');
      });

      it('should return formatted date for other days', () => {
        const future = new Date(2026, 1, 15);
        const result = formatRelativeDate(future);
        expect(result).toContain('Feb');
        expect(result).toContain('15');
      });
    });
  });
});

import { useState, useCallback, useMemo, useEffect } from 'react';
import { CalendarMode, CalendarDay, Task } from '../types';
import {
  formatMonthTitle,
  formatWeekTitle,
  buildCalendarDays,
  buildWeekDays,
  getStartOfWeek,
  getWeekNumber,
} from '../lib/calendar-utils';

const STORAGE_KEY = 'bordy-calendar-preferences';

interface CalendarPreferences {
  calendarMode: CalendarMode;
}

interface UseCalendarProps {
  tasks: Task[];
}

interface UseCalendarReturn {
  // Current view state
  currentDate: Date;
  currentYear: number;
  currentMonth: number;
  calendarMode: CalendarMode;
  
  // Navigation
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToDate: (date: Date) => void;
  setCalendarMode: (mode: CalendarMode) => void;
  
  // Computed display values
  displayTitle: string;
  weekNumber: number;
  
  // Calendar data
  calendarDays: CalendarDay[];
  
  // Helpers
  isCurrentMonth: boolean;
  isCurrentWeek: boolean;
}

export function useCalendar({ tasks }: UseCalendarProps): UseCalendarReturn {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [calendarMode, setCalendarModeState] = useState<CalendarMode>('month');

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs: CalendarPreferences = JSON.parse(stored);
        if (prefs.calendarMode) {
          setCalendarModeState(prefs.calendarMode);
        }
      }
    } catch (error) {
      console.error('Failed to load calendar preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((prefs: Partial<CalendarPreferences>) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const current: CalendarPreferences = stored 
        ? JSON.parse(stored) 
        : { calendarMode: 'month' };
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save calendar preferences:', error);
    }
  }, []);

  // Set calendar mode with persistence
  const setCalendarMode = useCallback((mode: CalendarMode) => {
    setCalendarModeState(mode);
    savePreferences({ calendarMode: mode });
  }, [savePreferences]);

  // Current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation functions
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (calendarMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      return newDate;
    });
  }, [calendarMode]);

  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (calendarMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  }, [calendarMode]);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Display title based on mode
  const displayTitle = useMemo(() => {
    if (calendarMode === 'month') {
      return formatMonthTitle(currentYear, currentMonth);
    } else {
      return formatWeekTitle(currentDate);
    }
  }, [calendarMode, currentYear, currentMonth, currentDate]);

  // Week number
  const weekNumber = useMemo(() => {
    return getWeekNumber(currentDate);
  }, [currentDate]);

  // Build calendar days based on mode
  const calendarDays = useMemo(() => {
    if (calendarMode === 'month') {
      return buildCalendarDays(currentYear, currentMonth, tasks);
    } else {
      return buildWeekDays(currentDate, tasks);
    }
  }, [calendarMode, currentYear, currentMonth, currentDate, tasks]);

  // Check if viewing current month
  const isCurrentMonth = useMemo(() => {
    const today = new Date();
    return currentYear === today.getFullYear() && currentMonth === today.getMonth();
  }, [currentYear, currentMonth]);

  // Check if viewing current week
  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const currentWeekStart = getStartOfWeek(currentDate);
    const todayWeekStart = getStartOfWeek(today);
    return currentWeekStart.getTime() === todayWeekStart.getTime();
  }, [currentDate]);

  return {
    // Current view state
    currentDate,
    currentYear,
    currentMonth,
    calendarMode,
    
    // Navigation
    goToToday,
    goToPrevious,
    goToNext,
    goToDate,
    setCalendarMode,
    
    // Computed display values
    displayTitle,
    weekNumber,
    
    // Calendar data
    calendarDays,
    
    // Helpers
    isCurrentMonth,
    isCurrentWeek,
  };
}

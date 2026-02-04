import { useState, useCallback, useEffect, useMemo } from 'react';
import { Task, TaskPriority } from '../types';

export type DueDateFilter = 'all' | 'overdue' | 'today' | 'this-week' | 'no-date';

export interface TaskFilters {
  searchQuery: string;
  labelIds: string[];
  dueDateFilter: DueDateFilter;
  priorities: TaskPriority[];
}

const STORAGE_KEY = 'bordy-task-filters';

const defaultFilters: TaskFilters = {
  searchQuery: '',
  labelIds: [],
  dueDateFilter: 'all',
  priorities: [],
};

// Helper functions for date comparisons
const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const isOverdue = (dueDate?: number): boolean => {
  if (!dueDate) return false;
  const today = getStartOfDay(new Date());
  const due = getStartOfDay(new Date(dueDate));
  return due.getTime() < today.getTime();
};

const isToday = (dueDate?: number): boolean => {
  if (!dueDate) return false;
  const today = getStartOfDay(new Date());
  const due = getStartOfDay(new Date(dueDate));
  return due.getTime() === today.getTime();
};

const isThisWeek = (dueDate?: number): boolean => {
  if (!dueDate) return false;
  const today = getStartOfDay(new Date());
  const due = getStartOfDay(new Date(dueDate));
  
  // Get end of this week (Sunday)
  const endOfWeek = new Date(today);
  const daysUntilSunday = 7 - today.getDay();
  endOfWeek.setDate(today.getDate() + daysUntilSunday);
  
  return due.getTime() >= today.getTime() && due.getTime() <= endOfWeek.getTime();
};

export function useTaskFilter(boardId?: string) {
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);

  // Load filters from localStorage on mount or board change
  useEffect(() => {
    if (!boardId) {
      setFilters(defaultFilters);
      return;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${boardId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFilters({
          searchQuery: parsed.searchQuery || '',
          labelIds: parsed.labelIds || [],
          dueDateFilter: parsed.dueDateFilter || 'all',
          priorities: parsed.priorities || [],
        });
      } else {
        setFilters(defaultFilters);
      }
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error);
      setFilters(defaultFilters);
    }
  }, [boardId]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (!boardId) return;

    try {
      localStorage.setItem(`${STORAGE_KEY}-${boardId}`, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }, [filters, boardId]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const toggleLabelFilter = useCallback((labelId: string) => {
    setFilters(prev => ({
      ...prev,
      labelIds: prev.labelIds.includes(labelId)
        ? prev.labelIds.filter(id => id !== labelId)
        : [...prev.labelIds, labelId],
    }));
  }, []);

  const setDueDateFilter = useCallback((filter: DueDateFilter) => {
    setFilters(prev => ({ ...prev, dueDateFilter: filter }));
  }, []);

  const togglePriorityFilter = useCallback((priority: TaskPriority) => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
  }, []);

  const removeLabelFilter = useCallback((labelId: string) => {
    setFilters(prev => ({
      ...prev,
      labelIds: prev.labelIds.filter(id => id !== labelId),
    }));
  }, []);

  const clearDueDateFilter = useCallback(() => {
    setFilters(prev => ({ ...prev, dueDateFilter: 'all' }));
  }, []);

  const removePriorityFilter = useCallback((priority: TaskPriority) => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.filter(p => p !== priority),
    }));
  }, []);

  const clearPriorityFilters = useCallback(() => {
    setFilters(prev => ({ ...prev, priorities: [] }));
  }, []);

  const filterTasks = useCallback((tasks: Task[]): Task[] => {
    return tasks.filter(task => {
      // 1. Search query (title OR description)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Label filter (OR logic - task must have at least one selected label)
      if (filters.labelIds.length > 0) {
        const hasMatchingLabel = task.labelIds.some(id => filters.labelIds.includes(id));
        if (!hasMatchingLabel) return false;
      }

      // 3. Due date filter
      if (filters.dueDateFilter !== 'all') {
        switch (filters.dueDateFilter) {
          case 'no-date':
            if (task.dueDate) return false;
            break;
          case 'overdue':
            if (!isOverdue(task.dueDate)) return false;
            break;
          case 'today':
            if (!isToday(task.dueDate)) return false;
            break;
          case 'this-week':
            if (!isThisWeek(task.dueDate)) return false;
            break;
        }
      }

      // 4. Priority filter (OR logic - task must have one of selected priorities)
      if (filters.priorities.length > 0) {
        const taskPriority = task.priority || 'none';
        if (!filters.priorities.includes(taskPriority)) return false;
      }

      return true;
    });
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery !== '' ||
      filters.labelIds.length > 0 ||
      filters.dueDateFilter !== 'all' ||
      filters.priorities.length > 0
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    count += filters.labelIds.length;
    if (filters.dueDateFilter !== 'all') count++;
    count += filters.priorities.length;
    return count;
  }, [filters]);

  return {
    filters,
    setSearchQuery,
    toggleLabelFilter,
    setDueDateFilter,
    togglePriorityFilter,
    clearFilters,
    clearSearch,
    removeLabelFilter,
    clearDueDateFilter,
    removePriorityFilter,
    clearPriorityFilters,
    filterTasks,
    hasActiveFilters,
    activeFilterCount,
  };
}

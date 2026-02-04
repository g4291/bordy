import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { Task, Label, CalendarMode } from '../../types';
import { useCalendar } from '../../hooks/useCalendar';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarTaskItem } from './CalendarTaskItem';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { formatAgendaDate } from '../../lib/calendar-utils';

export interface CalendarControls {
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  setCalendarMode: (mode: CalendarMode) => void;
  calendarMode: CalendarMode;
}

interface CalendarViewProps {
  tasks: Task[];
  labels: Label[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (columnId: string, title: string, description?: string, dueDate?: number) => void;
  onUpdateTask: (taskId: string, updates: { dueDate?: number }) => void;
  onTaskDateChange?: (taskId: string, newDate: Date) => void;
  defaultColumnId?: string;
  controlsRef?: React.MutableRefObject<CalendarControls | null>;
}

export function CalendarView({
  tasks,
  labels,
  onTaskClick,
  onCreateTask,
  onUpdateTask,
  onTaskDateChange,
  defaultColumnId,
  controlsRef,
}: CalendarViewProps) {
  const {
    calendarMode,
    setCalendarMode,
    displayTitle,
    goToToday,
    goToPrevious,
    goToNext,
    calendarDays,
    isCurrentMonth,
    isCurrentWeek,
  } = useCalendar({ tasks });

  // Expose controls via ref for keyboard shortcuts
  useEffect(() => {
    if (controlsRef) {
      controlsRef.current = {
        goToToday,
        goToPrevious,
        goToNext,
        setCalendarMode,
        calendarMode,
      };
    }
  }, [controlsRef, goToToday, goToPrevious, goToNext, setCalendarMode, calendarMode]);

  // Quick add task dialog
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [addTaskDate, setAddTaskDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Day tasks modal (when clicking "+X more")
  const [dayTasksModal, setDayTasksModal] = useState<{ date: Date; tasks: Task[] } | null>(null);

  // Drag state
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle add task
  const handleAddTask = (date: Date) => {
    setAddTaskDate(date);
    setNewTaskTitle('');
    setIsAddingTask(true);
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim() && addTaskDate && defaultColumnId) {
      onCreateTask(
        defaultColumnId,
        newTaskTitle.trim(),
        undefined,
        addTaskDate.getTime()
      );
      setIsAddingTask(false);
      setNewTaskTitle('');
      setAddTaskDate(null);
    }
  };

  // Handle show all tasks for a day
  const handleShowAllTasks = (date: Date, dayTasks: Task[]) => {
    setDayTasksModal({ date, tasks: dayTasks });
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedTask = tasks.find(t => t.id === active.id);
    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const droppedDateKey = over.id as string;

    // Parse the date from the droppable ID (format: "day-YYYY-MM-DD")
    if (droppedDateKey.startsWith('day-')) {
      const dateString = droppedDateKey.replace('day-', '');
      const newDate = new Date(dateString);
      
      // Check if date is valid
      if (!isNaN(newDate.getTime())) {
        // Find the task to check if the date actually changed
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const existingDateKey = task.dueDate 
            ? new Date(task.dueDate).toISOString().split('T')[0]
            : null;
          
          if (existingDateKey !== dateString) {
            if (onTaskDateChange) {
              onTaskDateChange(taskId, newDate);
            } else {
              onUpdateTask(taskId, { dueDate: newDate.getTime() });
            }
          }
        }
      }
    }
  };

  // Check if we can show "Today" button
  const showTodayButton = calendarMode === 'month' ? !isCurrentMonth : !isCurrentWeek;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Calendar Header - fixed */}
        <div className="flex items-center justify-between p-4 flex-shrink-0 bg-background border-b">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              title={calendarMode === 'month' ? 'Previous month ([)' : 'Previous week ([)'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {displayTitle}
            </h2>
            
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              title={calendarMode === 'month' ? 'Next month (])' : 'Next week (])'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {showTodayButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="ml-2"
                title="Go to today (T)"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Today
              </Button>
            )}
          </div>

          {/* Mode switcher */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={calendarMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalendarMode('month')}
              className="h-7 px-3"
              title="Month view (M)"
            >
              Month
            </Button>
            <Button
              variant={calendarMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalendarMode('week')}
              className="h-7 px-3"
              title="Week view (W)"
            >
              Week
            </Button>
          </div>
        </div>

        {/* Calendar Content - scrollable */}
        <div className="flex-1 overflow-hidden p-4 pb-0">
          <div className="h-full overflow-auto">
            {calendarMode === 'month' ? (
              <CalendarMonthView
                days={calendarDays}
                labels={labels}
                onTaskClick={onTaskClick}
                onAddTask={handleAddTask}
                onShowAllTasks={handleShowAllTasks}
              />
            ) : (
              <CalendarWeekView
                days={calendarDays}
                labels={labels}
                onTaskClick={onTaskClick}
                onAddTask={handleAddTask}
                onShowAllTasks={handleShowAllTasks}
              />
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask && (
            <div className="opacity-80 rotate-2 scale-105">
              <CalendarTaskItem
                task={activeTask}
                labels={labels}
                onClick={() => {}}
                compact={calendarMode === 'month'}
              />
            </div>
          )}
        </DragOverlay>

        {/* Quick Add Task Dialog */}
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add Task
                {addTaskDate && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    → {formatAgendaDate(addTaskDate)}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTaskTitle.trim()) {
                    handleCreateTask();
                  }
                }}
              />
              {!defaultColumnId && (
                <p className="text-sm text-destructive mt-2">
                  No column available. Please create a column first.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim() || !defaultColumnId}
              >
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Day Tasks Modal (shows all tasks for a day) */}
        <Dialog 
          open={dayTasksModal !== null} 
          onOpenChange={(open) => !open && setDayTasksModal(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {dayTasksModal && formatAgendaDate(dayTasksModal.date)}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {dayTasksModal?.tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => {
                    onTaskClick(task);
                    setDayTasksModal(null);
                  }}
                  className={`
                    w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors
                    flex items-start gap-3
                    ${task.completed ? 'opacity-60' : ''}
                  `}
                >
                  {task.completed && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className={`text-sm text-muted-foreground mt-1 line-clamp-2 ${task.completed ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  {task.completed && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium flex-shrink-0">
                      Done
                    </span>
                  )}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDayTasksModal(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (dayTasksModal) {
                    handleAddTask(dayTasksModal.date);
                    setDayTasksModal(null);
                  }
                }}
              >
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndContext>
  );
}

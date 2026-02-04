import React from 'react';
import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { CalendarDay, Task, Label, CalendarMode } from '../../types';
import { CalendarTaskItem, MoreTasksIndicator, DraggableCalendarTaskItem } from './CalendarTaskItem';

interface CalendarDayCellProps {
  day: CalendarDay;
  labels: Label[];
  calendarMode: CalendarMode;
  onTaskClick: (task: Task) => void;
  onAddTask: (date: Date) => void;
  onShowAllTasks: (date: Date, tasks: Task[]) => void;
  maxVisibleTasks?: number;
}

export function CalendarDayCell({
  day,
  labels,
  calendarMode,
  onTaskClick,
  onAddTask,
  onShowAllTasks,
  maxVisibleTasks = 3,
}: CalendarDayCellProps) {
  const { date, dateKey, isCurrentMonth, isToday, isWeekend, tasks } = day;
  const dayNumber = date.getDate();
  
  // Droppable setup
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dateKey}`,
  });
  
  const visibleTasks = tasks.slice(0, maxVisibleTasks);
  const hiddenCount = tasks.length - maxVisibleTasks;
  const hasMoreTasks = hiddenCount > 0;

  const handleCellClick = () => {
    // If clicking on empty area, prompt to add task
    onAddTask(date);
  };

  const handleMoreClick = () => {
    onShowAllTasks(date, tasks);
  };

  if (calendarMode === 'month') {
    return (
      <div
        ref={setNodeRef}
        className={`
          min-h-[100px] p-1 border-r border-b
          flex flex-col
          transition-colors cursor-pointer group
          ${!isCurrentMonth ? 'bg-muted/30' : 'bg-background'}
          ${isWeekend && isCurrentMonth ? 'bg-muted/20' : ''}
          ${isToday ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}
          ${isOver ? 'bg-primary/10 ring-2 ring-primary/50 ring-inset' : ''}
          hover:bg-accent/50
        `}
        onClick={handleCellClick}
      >
        {/* Day number header */}
        <div className="flex items-center justify-between mb-1">
          <span
            className={`
              text-sm font-medium px-1.5 py-0.5 rounded-full
              ${isToday ? 'bg-primary text-primary-foreground' : ''}
              ${!isCurrentMonth ? 'text-muted-foreground' : ''}
            `}
          >
            {dayNumber}
          </span>
          
          {/* Quick add button (shows on hover) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddTask(date);
            }}
            className="
              opacity-0 group-hover:opacity-100
              p-0.5 rounded hover:bg-muted
              text-muted-foreground hover:text-foreground
              transition-opacity
            "
            title="Add task"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tasks list */}
        <div className="flex-1 space-y-0.5 overflow-hidden">
          {visibleTasks.map(task => (
            <DraggableCalendarTaskItem
              key={task.id}
              task={task}
              labels={labels}
              onClick={onTaskClick}
              compact={true}
            />
          ))}
          
          {hasMoreTasks && (
            <MoreTasksIndicator 
              count={hiddenCount} 
              onClick={handleMoreClick} 
            />
          )}
        </div>
      </div>
    );
  }

  // Week view - taller cells with more detail
  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[200px] p-2 border-r
        flex flex-col
        transition-colors
        ${!isCurrentMonth ? 'bg-muted/30' : 'bg-background'}
        ${isWeekend && isCurrentMonth ? 'bg-muted/20' : ''}
        ${isToday ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}
        ${isOver ? 'bg-primary/10 ring-2 ring-primary/50 ring-inset' : ''}
      `}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b">
        <div className="flex items-center gap-2">
          <span
            className={`
              text-lg font-semibold px-2 py-0.5 rounded-full
              ${isToday ? 'bg-primary text-primary-foreground' : ''}
              ${!isCurrentMonth ? 'text-muted-foreground' : ''}
            `}
          >
            {dayNumber}
          </span>
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTask(date);
          }}
          className="
            p-1 rounded hover:bg-muted
            text-muted-foreground hover:text-foreground
            transition-colors
          "
          title="Add task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Tasks list - scrollable */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.length === 0 ? (
          <div 
            className="h-full flex items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-accent/50 rounded-md p-4"
            onClick={handleCellClick}
          >
            No tasks
          </div>
        ) : (
          tasks.map(task => (
            <DraggableCalendarTaskItem
              key={task.id}
              task={task}
              labels={labels}
              onClick={onTaskClick}
              compact={false}
            />
          ))
        )}
      </div>

      {/* Add task button at bottom */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddTask(date);
        }}
        className="
          mt-2 w-full py-1.5 rounded-md border border-dashed
          text-sm text-muted-foreground
          hover:bg-accent hover:text-foreground hover:border-solid
          transition-colors flex items-center justify-center gap-1
        "
      >
        <Plus className="h-3.5 w-3.5" />
        Add task
      </button>
    </div>
  );
}

/**
 * Header cell for day names (Mon, Tue, etc.)
 */
interface DayHeaderCellProps {
  dayName: string;
  isWeekend?: boolean;
}

export function DayHeaderCell({ dayName, isWeekend = false }: DayHeaderCellProps) {
  return (
    <div
      className={`
        py-2 px-1 text-center text-sm font-medium border-r border-b
        ${isWeekend ? 'text-muted-foreground' : 'text-foreground'}
      `}
    >
      {dayName}
    </div>
  );
}

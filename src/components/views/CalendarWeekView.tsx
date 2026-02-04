import React from 'react';
import { CalendarDay, Task, Label } from '../../types';
import { CalendarDayCell } from './CalendarDayCell';

interface CalendarWeekViewProps {
  days: CalendarDay[];
  labels: Label[];
  onTaskClick: (task: Task) => void;
  onAddTask: (date: Date) => void;
  onShowAllTasks: (date: Date, tasks: Task[]) => void;
}

export function CalendarWeekView({
  days,
  labels,
  onTaskClick,
  onAddTask,
  onShowAllTasks,
}: CalendarWeekViewProps) {
  return (
    <div className="flex border rounded-lg bg-background min-h-full min-w-max">
      {days.map((day, index) => (
        <div 
          key={day.dateKey} 
          className={`
            flex-1 min-w-[140px]
            ${index !== days.length - 1 ? 'border-r' : ''}
          `}
        >
          <CalendarDayCell
            day={day}
            labels={labels}
            calendarMode="week"
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
            onShowAllTasks={onShowAllTasks}
          />
        </div>
      ))}
    </div>
  );
}

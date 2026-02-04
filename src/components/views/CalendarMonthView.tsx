import React from 'react';
import { CalendarDay, Task, Label } from '../../types';
import { CalendarDayCell, DayHeaderCell } from './CalendarDayCell';

interface CalendarMonthViewProps {
  days: CalendarDay[];
  labels: Label[];
  onTaskClick: (task: Task) => void;
  onAddTask: (date: Date) => void;
  onShowAllTasks: (date: Date, tasks: Task[]) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarMonthView({
  days,
  labels,
  onTaskClick,
  onAddTask,
  onShowAllTasks,
}: CalendarMonthViewProps) {
  // Split days into weeks (7 days each)
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="border rounded-lg bg-background min-h-full">
      {/* Day headers - sticky */}
      <div className="grid grid-cols-7 sticky top-0 z-10 bg-background border-b">
        {DAY_NAMES.map((name, index) => (
          <DayHeaderCell 
            key={name} 
            dayName={name} 
            isWeekend={index >= 5}
          />
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-rows-6">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day) => (
              <div key={day.dateKey} className="group border-r last:border-r-0 min-h-[100px]">
                <CalendarDayCell
                  day={day}
                  labels={labels}
                  calendarMode="month"
                  onTaskClick={onTaskClick}
                  onAddTask={onAddTask}
                  onShowAllTasks={onShowAllTasks}
                  maxVisibleTasks={3}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

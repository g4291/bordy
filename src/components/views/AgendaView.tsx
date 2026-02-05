import React, { useMemo, useState, useRef } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Calendar, CalendarClock, Clock, CalendarX, CheckCircle2 } from 'lucide-react';
import { Task, Label, PRIORITY_CONFIG } from '../../types';
import { Button } from '../ui/button';
import { LabelBadge } from '../LabelBadge';
import { PriorityBadge } from '../PriorityBadge';
import { SubtaskProgress } from '../SubtaskProgress';
import {
  isToday,
  isTomorrow,
  isThisWeek,
  isPast,
  formatRelativeDate,
} from '../../lib/calendar-utils';

interface AgendaViewProps {
  tasks: Task[];
  labels: Label[];
  onTaskClick: (task: Task) => void;
}

interface AgendaSection {
  id: string;
  title: string;
  icon: React.ElementType;
  iconClass: string;
  tasks: Task[];
  collapsible: boolean;
  defaultCollapsed: boolean;
}

export function AgendaView({ tasks, labels, onTaskClick }: AgendaViewProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['no-date']));
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group tasks into sections
  const sections = useMemo((): AgendaSection[] => {
    const overdue: Task[] = [];
    const today: Task[] = [];
    const tomorrow: Task[] = [];
    const thisWeek: Task[] = [];
    const later: Task[] = [];
    const noDate: Task[] = [];

    tasks.forEach(task => {
      if (!task.dueDate) {
        noDate.push(task);
        return;
      }

      const dueDate = new Date(task.dueDate);

      // Completed tasks are never overdue
      if (isPast(dueDate) && !isToday(dueDate) && !task.completed) {
        overdue.push(task);
      } else if (isToday(dueDate)) {
        today.push(task);
      } else if (isTomorrow(dueDate)) {
        tomorrow.push(task);
      } else if (isThisWeek(dueDate)) {
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    });

    // Sort tasks within each section by due date, then by priority
    // Completed tasks go to the bottom of each section
    const sortTasks = (a: Task, b: Task) => {
      // Completed tasks go to the bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // First by due date
      if (a.dueDate && b.dueDate) {
        const dateDiff = a.dueDate - b.dueDate;
        if (dateDiff !== 0) return dateDiff;
      }
      // Then by priority (higher priority first)
      const priorityOrder = PRIORITY_CONFIG[b.priority || 'none'].order - 
                           PRIORITY_CONFIG[a.priority || 'none'].order;
      return priorityOrder;
    };

    overdue.sort(sortTasks);
    today.sort(sortTasks);
    tomorrow.sort(sortTasks);
    thisWeek.sort(sortTasks);
    later.sort(sortTasks);

    return [
      {
        id: 'overdue',
        title: `Overdue (${overdue.length})`,
        icon: AlertTriangle,
        iconClass: 'text-destructive',
        tasks: overdue,
        collapsible: false,
        defaultCollapsed: false,
      },
      {
        id: 'today',
        title: 'Today',
        icon: Calendar,
        iconClass: 'text-primary',
        tasks: today,
        collapsible: false,
        defaultCollapsed: false,
      },
      {
        id: 'tomorrow',
        title: 'Tomorrow',
        icon: CalendarClock,
        iconClass: 'text-blue-500',
        tasks: tomorrow,
        collapsible: false,
        defaultCollapsed: false,
      },
      {
        id: 'this-week',
        title: 'This Week',
        icon: Clock,
        iconClass: 'text-green-500',
        tasks: thisWeek,
        collapsible: true,
        defaultCollapsed: false,
      },
      {
        id: 'later',
        title: 'Later',
        icon: Calendar,
        iconClass: 'text-muted-foreground',
        tasks: later,
        collapsible: true,
        defaultCollapsed: false,
      },
      {
        id: 'no-date',
        title: `No Date (${noDate.length})`,
        icon: CalendarX,
        iconClass: 'text-muted-foreground',
        tasks: noDate,
        collapsible: true,
        defaultCollapsed: true,
      },
    ].filter(section => section.tasks.length > 0 || section.id === 'today');
  }, [tasks]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const scrollToToday = () => {
    // Find the today section element within the scroll container
    const todaySection = document.getElementById('agenda-section-today');
    const container = scrollContainerRef.current;
    
    if (todaySection && container) {
      // Calculate the offset within the scrollable container
      const containerRect = container.getBoundingClientRect();
      const sectionRect = todaySection.getBoundingClientRect();
      const offsetTop = sectionRect.top - containerRect.top + container.scrollTop;
      
      // Scroll within the container only
      container.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
        <p className="text-muted-foreground">
          Create tasks in Kanban view to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden max-w-[900px] mx-auto w-full">
      {/* Header - fixed at top */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-background">
        <h2 className="text-xl font-semibold">Agenda</h2>
        <Button variant="outline" size="sm" onClick={scrollToToday}>
          <Calendar className="h-4 w-4 mr-1" />
          Jump to Today
        </Button>
      </div>

      {/* Sections - scrollable */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {sections.map(section => {
          const isCollapsed = collapsedSections.has(section.id);
          const Icon = section.icon;

          return (
            <div 
              key={section.id} 
              id={`agenda-section-${section.id}`}
              className="border rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => section.collapsible && toggleSection(section.id)}
                className={`
                  w-full flex items-center gap-2 p-3 bg-muted/50
                  ${section.collapsible ? 'cursor-pointer hover:bg-muted' : 'cursor-default'}
                  transition-colors
                `}
              >
                {section.collapsible && (
                  isCollapsed 
                    ? <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                <Icon className={`h-4 w-4 ${section.iconClass}`} />
                <span className="font-medium">{section.title}</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {section.tasks.length} task{section.tasks.length !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Section Content */}
              {!isCollapsed && (
                <div className="divide-y">
                  {section.tasks.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No tasks
                    </div>
                  ) : (
                    section.tasks.map(task => (
                      <AgendaTaskItem
                        key={task.id}
                        task={task}
                        labels={labels}
                        onClick={() => onTaskClick(task)}
                        showDate={section.id === 'this-week' || section.id === 'later' || section.id === 'overdue'}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Individual task item in agenda
interface AgendaTaskItemProps {
  task: Task;
  labels: Label[];
  onClick: () => void;
  showDate?: boolean;
}

function AgendaTaskItem({ task, labels, onClick, showDate = false }: AgendaTaskItemProps) {
  const taskLabels = labels.filter(l => task.labelIds?.includes(l.id));
  const priority = task.priority || 'none';
  const priorityConfig = PRIORITY_CONFIG[priority];
  const subtasks = task.subtasks || [];
  const hasSubtasks = subtasks.length > 0;
  const isCompleted = task.completed;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 hover:bg-accent/50 transition-colors
        flex items-start gap-3
        ${isCompleted ? 'opacity-60' : ''}
        ${priority !== 'none' && !isCompleted ? priorityConfig.borderClass : ''}
      `}
    >
      {/* Completed indicator or Priority indicator */}
      {isCompleted ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      ) : priority !== 'none' ? (
        <span 
          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
          style={{ backgroundColor: priorityConfig.color }}
        />
      ) : null}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </p>
            
            {/* Labels */}
            {taskLabels.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-1 ${isCompleted ? 'opacity-60' : ''}`}>
                {taskLabels.map(label => (
                  <LabelBadge key={label.id} label={label} size="sm" />
                ))}
              </div>
            )}
            
            {/* Description preview */}
            {task.description && (
              <p className={`text-sm text-muted-foreground mt-1 line-clamp-1 ${isCompleted ? 'line-through' : ''}`}>
                {task.description}
              </p>
            )}
          </div>

          {/* Right side info */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {/* Completed badge */}
            {isCompleted && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Done
              </span>
            )}
            
            {/* Due date */}
            {showDate && task.dueDate && !isCompleted && (
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(new Date(task.dueDate))}
              </span>
            )}
            
            {/* Priority badge */}
            {priority !== 'none' && !isCompleted && (
              <PriorityBadge priority={priority} size="sm" />
            )}
          </div>
        </div>

        {/* Subtask progress */}
        {hasSubtasks && (
          <div className="mt-2">
            <SubtaskProgress subtasks={subtasks} />
          </div>
        )}
      </div>
    </button>
  );
}

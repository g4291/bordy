import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, SearchX } from 'lucide-react';
import { Column, Task, Label } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface KanbanBoardProps {
  columns: Column[];
  tasks: Map<string, Task[]>;
  labels: Label[];
  onCreateColumn: (title: string) => void;
  onUpdateColumn: (id: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
  onReorderColumns: (columns: Column[]) => void;
  onCreateTask: (columnId: string, title: string, description?: string) => void;
  onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds' | 'dueDate' | 'subtasks'>>) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, newIndex: number) => void;
  onAddSubtask: (taskId: string, title: string) => Promise<any>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onUpdateSubtask: (taskId: string, subtaskId: string, title: string) => Promise<void>;
  // Filter props
  filterTasks: (tasks: Task[]) => Task[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  // Keyboard shortcut props
  isNewTaskDialogOpen?: boolean;
  setIsNewTaskDialogOpen?: (open: boolean) => void;
  onDialogOpenChange?: (isOpen: boolean) => void;
}

type DragType = 'column' | 'task' | null;

export function KanbanBoard({
  columns,
  tasks,
  labels,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumns,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
  filterTasks,
  hasActiveFilters,
  onClearFilters,
  isNewTaskDialogOpen,
  setIsNewTaskDialogOpen,
  onDialogOpenChange,
}: KanbanBoardProps) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [dragType, setDragType] = useState<DragType>(null);

  // New task dialog state (can be controlled externally)
  const [isAddingTaskInternal, setIsAddingTaskInternal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');

  // Use external or internal state for new task dialog
  const isAddingTask = isNewTaskDialogOpen ?? isAddingTaskInternal;
  const setIsAddingTask = setIsNewTaskDialogOpen ?? setIsAddingTaskInternal;

  // Notify parent about dialog state changes
  useEffect(() => {
    onDialogOpenChange?.(isAddingColumn || isAddingTask);
  }, [isAddingColumn, isAddingTask, onDialogOpenChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      onCreateColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  // Handle add task to first column
  const handleAddTask = () => {
    if (newTaskTitle.trim() && columns.length > 0) {
      onCreateTask(
        columns[0].id,
        newTaskTitle.trim(),
        undefined
      );
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setIsAddingTask(false);
    }
  };

  // Original tasks lookup (for drag & drop, we need to find tasks in original data)
  const findTaskById = (id: string): { task: Task; columnId: string } | null => {
    const entries = Array.from(tasks.entries());
    for (const [columnId, columnTasks] of entries) {
      const task = columnTasks.find((t: Task) => t.id === id);
      if (task) return { task, columnId };
    }
    return null;
  };

  // Calculate filtered tasks for each column
  const filteredTasksMap = useMemo(() => {
    const map = new Map<string, Task[]>();
    columns.forEach(column => {
      const columnTasks = tasks.get(column.id) || [];
      map.set(column.id, filterTasks(columnTasks));
    });
    return map;
  }, [columns, tasks, filterTasks]);

  // Check if no results after filtering (for showing empty state)
  const noFilteredResults = useMemo(() => {
    if (!hasActiveFilters) return false;
    
    let totalTasks = 0;
    let filteredTasks = 0;
    
    columns.forEach(column => {
      const columnTasks = tasks.get(column.id) || [];
      totalTasks += columnTasks.length;
      filteredTasks += (filteredTasksMap.get(column.id) || []).length;
    });

    return totalTasks > 0 && filteredTasks === 0;
  }, [hasActiveFilters, columns, tasks, filteredTasksMap]);

  // Custom collision detection based on what we're dragging
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    // When dragging a column, only detect other columns
    if (dragType === 'column') {
      const { droppableContainers, ...rest } = args;
      
      // Filter to only include column containers (exclude task drop zones and tasks)
      const columnContainers = droppableContainers.filter(container => {
        const data = container.data.current;
        return data?.type === 'column';
      });

      return closestCenter({
        ...rest,
        droppableContainers: columnContainers,
      });
    }

    // When dragging a task, use default behavior but prioritize tasks
    if (dragType === 'task') {
      // First try pointerWithin for precise detection
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) {
        return pointerCollisions;
      }
      // Fallback to rectIntersection
      return rectIntersection(args);
    }

    return [];
  }, [dragType]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'column') {
      setActiveColumn(activeData.column);
      setActiveTask(null);
      setDragType('column');
    } else if (activeData?.type === 'task') {
      setActiveTask(activeData.task);
      setActiveColumn(null);
      setDragType('task');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    const currentDragType = dragType;
    setActiveTask(null);
    setActiveColumn(null);
    setDragType(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle column reordering
    if (currentDragType === 'column' && activeData?.type === 'column') {
      const activeColumnId = active.id as string;
      const overColumnId = over.id as string;
      
      if (activeColumnId !== overColumnId) {
        const oldIndex = columns.findIndex(c => c.id === activeColumnId);
        const newIndex = columns.findIndex(c => c.id === overColumnId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newColumns = arrayMove(columns, oldIndex, newIndex);
          onReorderColumns(newColumns);
        }
      }
      return;
    }

    // Handle task movement
    if (currentDragType === 'task') {
      const activeId = active.id as string;
      const activeResult = findTaskById(activeId);
      if (!activeResult) return;

      const { columnId: sourceColumnId } = activeResult;

      // Dropped on a column drop zone
      if (overData?.type === 'column-drop') {
        const targetColumnId = overData.columnId;
        const targetTasks = tasks.get(targetColumnId) || [];
        onMoveTask(activeId, sourceColumnId, targetColumnId, targetTasks.length);
        return;
      }

      // Dropped on another task
      if (overData?.type === 'task') {
        const overTask = overData.task as Task;
        const targetColumnId = overTask.columnId;
        const targetTasks = tasks.get(targetColumnId) || [];
        const newIndex = targetTasks.findIndex((t: Task) => t.id === overTask.id);
        onMoveTask(activeId, sourceColumnId, targetColumnId, newIndex >= 0 ? newIndex : targetTasks.length);
        return;
      }

      // Dropped on a column itself (find by id)
      const targetColumn = columns.find(c => c.id === over.id);
      if (targetColumn) {
        const targetTasks = tasks.get(targetColumn.id) || [];
        onMoveTask(activeId, sourceColumnId, targetColumn.id, targetTasks.length);
      }
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 h-full">
      {/* No results message */}
      {noFilteredResults && (
        <div className="flex flex-col items-center justify-center h-[50%] text-center">
          <SearchX className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No tasks match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" onClick={onClearFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map(c => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className={`flex gap-4 h-full ${noFilteredResults ? 'hidden' : ''}`}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={filteredTasksMap.get(column.id) || []}
                allTasksCount={tasks.get(column.id)?.length || 0}
                labels={labels}
                onUpdateColumn={onUpdateColumn}
                onDeleteColumn={onDeleteColumn}
                onCreateTask={onCreateTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onUpdateSubtask={onUpdateSubtask}
                hasActiveFilters={hasActiveFilters}
              />
            ))}

            <Button
              variant="outline"
              className="w-72 h-12 flex-shrink-0 border-dashed"
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <div className="w-64 rotate-3">
              <TaskCard
                task={activeTask}
                labels={labels}
                onUpdate={() => {}}
                onAddSubtask={async () => {}}
                onToggleSubtask={async () => {}}
                onDeleteSubtask={async () => {}}
                onUpdateSubtask={async () => {}}
                onDelete={() => {}}
              />
            </div>
          )}
          {activeColumn && (
            <Card className="w-72 bg-muted/90 shadow-xl rotate-3">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">
                  {activeColumn.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="min-h-[100px] flex items-center justify-center text-muted-foreground text-sm">
                  {tasks.get(activeColumn.id)?.length || 0} tasks
                </div>
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add Column Dialog */}
      <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <Input
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="Column title"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddColumn();
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingColumn(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Task Dialog (N shortcut) */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Quick Add Task
              {columns.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  → {columns[0].title}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTaskTitle.trim()) handleAddTask();
              }}
              autoFocus
            />
            <Input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              placeholder="Due date (optional)"
              className="text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTask(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTaskTitle.trim() || columns.length === 0}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

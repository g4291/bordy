import React, { useState, useCallback } from 'react';
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
import { Plus } from 'lucide-react';
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
  onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds'>>) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, newIndex: number) => void;
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
}: KanbanBoardProps) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [dragType, setDragType] = useState<DragType>(null);

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

  const findTaskById = (id: string): { task: Task; columnId: string } | null => {
    const entries = Array.from(tasks.entries());
    for (const [columnId, columnTasks] of entries) {
      const task = columnTasks.find((t: Task) => t.id === id);
      if (task) return { task, columnId };
    }
    return null;
  };

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
          <div className="flex gap-4 h-full">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasks.get(column.id) || []}
                labels={labels}
                onUpdateColumn={onUpdateColumn}
                onDeleteColumn={onDeleteColumn}
                onCreateTask={onCreateTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
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
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingColumn(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Subtask } from '../types';

interface SubtaskProgressProps {
  subtasks: Subtask[];
  showBar?: boolean;
  className?: string;
}

export function SubtaskProgress({ subtasks, showBar = true, className = '' }: SubtaskProgressProps) {
  if (!subtasks || subtasks.length === 0) return null;

  const completed = subtasks.filter(s => s.completed).length;
  const total = subtasks.length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {completed}/{total}
      </span>
      {showBar && (
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[40px]">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              percentage === 100 
                ? 'bg-green-500' 
                : percentage > 0 
                  ? 'bg-blue-500' 
                  : 'bg-muted'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

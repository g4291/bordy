import React from 'react';
import { Lock, User } from 'lucide-react';
import { BoardTemplate } from '../types';
import { cn } from '../lib/utils';

interface TemplatePickerProps {
  templates: BoardTemplate[];
  selectedTemplate: BoardTemplate | null;
  onSelectTemplate: (template: BoardTemplate) => void;
}

export function TemplatePicker({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplatePickerProps) {
  // Separate templates into custom and built-in
  const customTemplates = templates.filter(t => !t.isBuiltIn);
  const builtInTemplates = templates.filter(t => t.isBuiltIn);

  const renderTemplate = (template: BoardTemplate) => (
    <button
      key={template.id}
      type="button"
      onClick={() => onSelectTemplate(template)}
      className={cn(
        'flex flex-col items-start p-3 rounded-lg border-2 text-left transition-all hover:border-primary/50',
        selectedTemplate?.id === template.id
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-muted/50'
      )}
    >
      <div className="flex items-center gap-2 mb-1 w-full">
        <span className="text-xl" role="img" aria-label={template.name}>
          {template.icon}
        </span>
        <span className="font-medium text-sm flex-1 truncate">{template.name}</span>
        {template.isBuiltIn ? (
          <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
        ) : (
          <User className="h-3 w-3 text-primary shrink-0" />
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {template.description}
      </p>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>{template.columns.length} columns</span>
        {template.labels.length > 0 && (
          <>
            <span>•</span>
            <span>{template.labels.length} labels</span>
          </>
        )}
        {template.tasks.length > 0 && (
          <>
            <span>•</span>
            <span>{template.tasks.length} tasks</span>
          </>
        )}
      </div>
    </button>
  );

  return (
    <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4">
      {/* Custom Templates Section */}
      {customTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              My Templates
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {customTemplates.map(renderTemplate)}
          </div>
        </div>
      )}

      {/* Built-in Templates Section */}
      <div>
        {customTemplates.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Built-in Templates
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {builtInTemplates.map(renderTemplate)}
        </div>
      </div>
    </div>
  );
}

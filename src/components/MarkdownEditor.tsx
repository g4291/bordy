import React, { useState, useEffect, useRef } from 'react';
import { Eye, Edit3, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  compact?: boolean;  // For smaller editors like comments
  showHelp?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  autoResize?: boolean;  // Auto-resize textarea to fit content
  defaultMode?: 'write' | 'preview';  // Default mode when opening
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  minHeight = '80px',
  compact = false,
  showHelp = true,
  onKeyDown,
  autoFocus = false,
  autoResize = false,
  defaultMode,
}: MarkdownEditorProps) {
  // Determine initial mode: if defaultMode provided use it, otherwise 'preview' if has content, else 'write'
  const getInitialMode = (): 'write' | 'preview' => {
    if (defaultMode) return defaultMode;
    return value.trim() ? 'preview' : 'write';
  };

  const [mode, setMode] = useState<'write' | 'preview'>(getInitialMode);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update mode when value changes from empty to non-empty (or vice versa) only if no defaultMode
  useEffect(() => {
    if (!defaultMode) {
      // Only auto-switch to preview if content was just added and we're in write mode with empty placeholder
      // Don't auto-switch while user is typing
    }
  }, [value, defaultMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (autoResize && textareaRef.current && mode === 'write') {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, parseInt(minHeight))}px`;
    }
  }, [value, autoResize, mode, minHeight]);

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={mode === 'write' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setMode('write')}
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Write
          </Button>
          <Button
            type="button"
            variant={mode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setMode('preview')}
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>
        {showHelp && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setShowHelpPanel(!showHelpPanel)}
            title="Markdown help"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Help Panel */}
      {showHelpPanel && (
        <div className="text-xs text-muted-foreground p-3 rounded-md bg-muted/50 border border-border space-y-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span><code className="bg-muted px-1 rounded">**bold**</code> → <strong>bold</strong></span>
            <span><code className="bg-muted px-1 rounded">*italic*</code> → <em>italic</em></span>
            <span><code className="bg-muted px-1 rounded">`code`</code> → <code className="bg-muted px-1 rounded">code</code></span>
            <span><code className="bg-muted px-1 rounded">~~strike~~</code> → <del>strike</del></span>
            <span><code className="bg-muted px-1 rounded">[link](url)</code> → link</span>
            <span><code className="bg-muted px-1 rounded">- item</code> → bullet list</span>
            <span><code className="bg-muted px-1 rounded">1. item</code> → numbered list</span>
            <span><code className="bg-muted px-1 rounded">- [ ] task</code> → checkbox</span>
            <span><code className="bg-muted px-1 rounded">&gt; quote</code> → blockquote</span>
            <span><code className="bg-muted px-1 rounded"># Heading</code> → heading</span>
          </div>
        </div>
      )}

      {/* Editor / Preview */}
      {mode === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-vertical"
          style={{ minHeight, height: autoResize ? 'auto' : undefined }}
        />
      ) : (
        <div 
          className="px-3 py-2 rounded-md border border-input bg-background overflow-auto"
          style={{ minHeight }}
        >
          {value.trim() ? (
            <MarkdownRenderer content={value} compact={compact} />
          ) : (
            <p className="text-sm text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      )}

      {/* Footer hint */}
      <p className="text-xs text-muted-foreground">
        Supports Markdown formatting
      </p>
    </div>
  );
}

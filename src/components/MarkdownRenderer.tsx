import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean;  // For smaller text in comments
}

export function MarkdownRenderer({ content, className = '', compact = false }: MarkdownRendererProps) {
  const baseClasses = compact
    ? 'prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2'
    : 'prose prose-sm dark:prose-invert max-w-none';

  return (
    <div 
      className={`
        ${baseClasses}
        prose-p:text-foreground
        prose-headings:text-foreground
        prose-strong:text-foreground
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:border prose-pre:border-border
        prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
        prose-ul:list-disc prose-ol:list-decimal
        prose-hr:border-border
        prose-th:text-foreground prose-td:text-foreground
        prose-img:rounded-md
        [&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:accent-primary
        ${className}
      `}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Open links in new tab
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          // Style checkboxes in task lists
          input: ({ node, ...props }) => (
            <input {...props} disabled className="mr-2 accent-primary" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

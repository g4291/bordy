import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { Comment } from '../types';
import { Button } from './ui/button';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MarkdownEditor } from './MarkdownEditor';

interface CommentItemProps {
  comment: Comment;
  onUpdate: (commentId: string, text: string) => void;
  onDelete: (commentId: string) => void;
}

export function CommentItem({ comment, onUpdate, onDelete }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(comment.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="p-3 border rounded-lg bg-muted/50">
        <MarkdownEditor
          value={editText}
          onChange={setEditText}
          onKeyDown={handleKeyDown}
          placeholder="Edit comment..."
          minHeight="60px"
          compact
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!editText.trim()}>
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ctrl+Enter to save, Escape to cancel
        </p>
      </div>
    );
  }

  return (
    <div className="group p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <MarkdownRenderer content={comment.text} compact />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(comment.createdAt)}</span>
          {comment.updatedAt && (
            <span className="italic">(edited)</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(comment.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

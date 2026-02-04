import React, { useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Comment } from '../types';
import { CommentItem } from './CommentItem';
import { Button } from './ui/button';

interface CommentListProps {
  taskId: string;
  comments: Comment[];
  onAddComment: (taskId: string, text: string) => Promise<Comment | undefined>;
  onUpdateComment: (taskId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment: (taskId: string, commentId: string) => Promise<void>;
}

export function CommentList({
  taskId,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: CommentListProps) {
  const [newComment, setNewComment] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Sort comments by createdAt (oldest first)
  const sortedComments = [...comments].sort((a, b) => a.createdAt - b.createdAt);

  const handleAdd = async () => {
    if (newComment.trim()) {
      setIsAdding(true);
      try {
        await onAddComment(taskId, newComment.trim());
        setNewComment('');
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAdd();
    }
  };

  const handleUpdate = (commentId: string, text: string) => {
    onUpdateComment(taskId, commentId, text);
  };

  const handleDelete = (commentId: string) => {
    onDeleteComment(taskId, commentId);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h4>
      </div>

      {/* Comments list */}
      {sortedComments.length > 0 && (
        <div className="space-y-2">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add comment form */}
      <div className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Ctrl+Enter to add
          </p>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newComment.trim() || isAdding}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

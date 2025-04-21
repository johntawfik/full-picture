"use client";

import { useState, useEffect } from 'react';
import styles from './CommentSection.module.css';

interface Comment {
  id: string;
  perspective_id: string;
  content: string;
  created_at?: string;
}

interface CommentSectionProps {
  perspectiveId: string;
  isOpen: boolean;
  onCommentsLoaded?: (count: number) => void;
  onCommentAdded?: () => void;
}

export default function CommentSection({ 
  perspectiveId, 
  isOpen, 
  onCommentsLoaded,
  onCommentAdded 
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch comments only when isOpen becomes true for the first time, or if perspectiveId changes while open
  useEffect(() => {
    // Only fetch if the section is open AND we haven't fetched yet for this perspectiveId
    if (isOpen && !hasFetched) {
      fetchComments();
    }
    // Reset fetch status if perspectiveId changes
    if (!isOpen) {
      setHasFetched(false);
      setComments([]); // Clear old comments when closing
      setError(null);
    }
  }, [isOpen, perspectiveId, hasFetched]);

  const fetchComments = async () => {
    if (!perspectiveId) return;
    setLoading(true);
    setError(null);
    setHasFetched(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perspectives/${perspectiveId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
      onCommentsLoaded?.(data.length);
    } catch (err) {
      setError('Error loading comments. Please try again later.');
      console.error('Error fetching comments:', err);
      onCommentsLoaded?.(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !perspectiveId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perspectives/${perspectiveId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      const updatedComments = [data, ...comments];
      setComments(updatedComments);
      setNewComment('');
      onCommentAdded?.();
    } catch (err) {
      setError('Error posting comment. Please try again later.');
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.commentTitle}>Comments</h3>
      
      <form onSubmit={handleSubmitComment} className={styles.commentForm}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className={styles.commentInput}
          maxLength={500}
        />
        <button 
          type="submit" 
          className={`${styles.submitArrow} ${newComment.trim() ? styles.visible : ''}`}
          disabled={loading || !newComment.trim()}
          aria-label="Post comment"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 7L20 12L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
      
      {error && <p className={styles.errorMessage}>{error}</p>}
      
      <div className={styles.commentList}>
        {loading && comments.length === 0 ? (
          <p className={styles.loading}>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className={styles.noComments}>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <p className={styles.commentContent}>{comment.content}</p>
              {comment.created_at && (
                <span className={styles.commentDate}>
                  {new Date(comment.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
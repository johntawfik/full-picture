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
  onCountChange?: (count: number) => void;
}

export default function CommentSection({ perspectiveId, isOpen, onCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API base URL - using localhost:8000 for backend
  const API_BASE_URL = 'http://localhost:8000';

  // Fetch comments when component mounts or perspectiveId changes
  useEffect(() => {
    fetchComments();
  }, [perspectiveId]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/perspectives/${perspectiveId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
      // Report count back to parent
      if (onCountChange) {
        onCountChange(data.length);
      }
    } catch (err) {
      setError('Error loading comments. Please try again later.');
      console.error('Error fetching comments:', err);
      // Report count as 0 or null in case of error? Let's report 0
      if (onCountChange) {
        onCountChange(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/perspectives/${perspectiveId}/comments`, {
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
      // Report updated count
      if (onCountChange) {
        onCountChange(updatedComments.length);
      }
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
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className={styles.commentInput}
          maxLength={500}
          rows={3}
        />
        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={loading || !newComment.trim()}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
      
      {error && <p className={styles.errorMessage}>{error}</p>}
      
      <div className={styles.commentList}>
        {loading ? (
          <p className={styles.loading}>Loading comments...</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <p className={styles.commentContent}>{comment.content}</p>
              {comment.created_at && (
                <span className={styles.commentDate}>
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
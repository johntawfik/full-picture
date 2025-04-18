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
}

export default function CommentSection({ perspectiveId, isOpen }: CommentSectionProps) {
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
    if (perspectiveId) { // Added guard for perspectiveId
      setHasFetched(false);
      setComments([]); // Clear old comments if ID changes
      setError(null);
    }

  }, [isOpen, perspectiveId, hasFetched]); // Added isOpen and hasFetched to dependencies

  const fetchComments = async () => {
    if (!perspectiveId) return; // Don't fetch if ID is missing
    setLoading(true);
    setError(null);
    setHasFetched(true); // Mark as fetched (or attempting)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_COMMENTS_URL}/api/perspectives/${perspectiveId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError('Error loading comments. Please try again later.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !perspectiveId) {
      return;
    }

    setLoading(true); // Consider a different loading state for posting?
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_COMMENTS_URL}/api/perspectives/${perspectiveId}/comments`, {
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
        ) : error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : comments.length === 0 ? (
          <p className={styles.noComments}>No comments yet.</p>
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
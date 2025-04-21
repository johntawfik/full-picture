"use client";

import styles from "./Card.module.css";
import { useState, useEffect } from "react";
import CommentSection from "./CommentSection";
import { FaRegComment } from "react-icons/fa";

interface CardProps {
  id: string;
  title: string;
  community: string;
  sentiment: number;
  quote: string;
  url: string;
  date: string;
  commentCount?: number;
}

export default function Card({
  id,
  title,
  community,
  sentiment,
  quote,
  url,
  date,
  commentCount = 0,
}: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentCommentCount, setCurrentCommentCount] = useState(commentCount);

  useEffect(() => {
    setCurrentCommentCount(commentCount);
  }, [commentCount]);

  const handleCommentAdded = () => {
    setCurrentCommentCount(prev => prev + 1);
  };

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const communityLabel = community.toLowerCase();
  
  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(prev => !prev);
  };

  const truncateWords = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    return words.length <= wordLimit
      ? text
      : words.slice(0, wordLimit).join(" ") + "...";
  };

  const wordLimit = 30;
  const words = quote.split(" ");
  const isTruncated = words.length > wordLimit;
  const displayText = expanded ? quote : (isTruncated ? truncateWords(quote, wordLimit) : quote);

  return (
    <div className={`${styles.card} ${styles[communityLabel]}`}>
      <div className={styles.cardHeader}>
        <span className={styles.perspective}>{community}</span>
        <span className={styles.date}>{formattedDate}</span>
      </div>
      
      <h3 className={styles.title}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </h3>
      
      <p className={styles.quote}>{displayText}</p>
      
      <div className={styles.cardFooter}>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.sourceLink}
        >
          View source
        </a>
        <button 
          className={styles.commentButton}
          onClick={toggleComments}
          aria-label="Toggle comments"
        >
          <FaRegComment className={styles.commentIcon} />
          {currentCommentCount > 0 && (
            <span className={styles.commentCount}>{currentCommentCount}</span>
          )}
        </button>
      </div>
      {showComments && (
        <CommentSection 
          perspectiveId={id} 
          isOpen={showComments}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}

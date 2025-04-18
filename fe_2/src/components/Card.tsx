// components/Card.tsx
import styles from "./Card.module.css";
import { useState } from "react";
import CommentSection from "./CommentSection";
import { FaRegComment } from "react-icons/fa";

interface CardProps {
  id: string;
  title: string;
  quote: string;
  imageUrl?: string;
  community: string;
  sentiment?: number;
  url: string;
  date: string;
}

const pillColor = (community: string) => {
  switch (community.toLowerCase()) {
    case "left":
      return "leftBadge";
    case "right":
      return "rightBadge";
    case "center":
      return "centerBadge";
    default:
      return "neutralBadge";
  }
};

export default function Card({
  id,
  title,
  quote,
  imageUrl,
  community,
  url,
  date
}: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState<number | null>(null);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments((prev) => !prev);
  };

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
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
    <div
      className={styles.card}
      onClick={isTruncated ? toggleExpanded : undefined}
      style={{ cursor: isTruncated ? "pointer" : "default" }}
    >
      {imageUrl && (
        <img src={imageUrl} alt={title} className={styles.cardImage} />
      )}
      <h2 className={styles.cardTitle}>{title}</h2>
      <div className={styles.badgeRow}>
        <div className={`${styles.communityBadge} ${styles[pillColor(community)]}`}>
          {community.charAt(0).toUpperCase() + community.slice(1)}
        </div>
        <div className={styles.dateBadge}>
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
      <p className={`${styles.cardText} ${expanded ? styles.expanded : ''}`}>{displayText}</p>
      {isTruncated && (
        <span className={styles.expandText}>{expanded ? "▲" : "▼"}</span>
      )}
      <div className={styles.cardFooter}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.externalLink}
          onClick={(e) => e.stopPropagation()}
        >
          Read original article ↗
        </a>
        <button 
          className={styles.commentButton}
          onClick={toggleComments}
          aria-label="Toggle comments"
        >
          <FaRegComment className={styles.commentIcon} />
          <span>
            Comments {commentCount !== null && commentCount > 0 ? `(${commentCount})` : ''}
          </span>
        </button>
      </div>
      <CommentSection 
        perspectiveId={id} 
        isOpen={showComments} 
        onCountChange={handleCommentCountChange} 
      />
    </div>
  );
}

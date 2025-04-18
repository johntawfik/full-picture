// components/Card.tsx
import styles from "./Card.module.css";
import { useState } from "react";

interface CardProps {
  title: string;
  quote: string;
  imageUrl?: string;
  community: string;
  sentiment?: number;
  url: string;
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

const getSentimentColor = (value: number) => {
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);
  const ratio = (clamp(value, -1, 1) + 1) / 2; // scale to [0, 1]

  const red = Math.round(255 * (1 - ratio));
  const green = Math.round(255 * ratio);
  return `rgb(${red}, ${green}, 100)`; // fixed blue tone for consistency
};

export default function Card({
  title,
  quote,
  imageUrl,
  community,
  url,
}: CardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
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
  const displayText =
    expanded || !isTruncated ? quote : truncateWords(quote, wordLimit);

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
        <div
          className={`${styles.communityBadge} ${styles[pillColor(community)]}`}
        >
          {community.charAt(0).toUpperCase() + community.slice(1)}
        </div>
      </div>
      <p className={styles.cardText}>{displayText}</p>

      <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.externalLink}
    >
      Read original article ↗
    </a>
      {isTruncated && (
        <span className={styles.expandText}>{expanded ? "▲" : "▼"}</span>
      )}
    </div>
  );
}

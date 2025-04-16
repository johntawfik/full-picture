// components/Card.tsx
import styles from "./Card.module.css";

interface CardProps {
  title: string;
  content: string[];
  imageUrl?: string;
  altText?: string;
}

export default function Card({ title, content, imageUrl, altText }: CardProps) {
  return (
    <div className={styles.card}>
      {imageUrl && (
        <img src={imageUrl} alt={title} className={styles.cardImage} />
      )}
      <h2 className={styles.cardTitle}>{title}</h2>
      {content.map((text, idx) => (
        <p key={idx} className={styles.cardText}>
          {text}
        </p>
      ))}
    </div>
  );
}

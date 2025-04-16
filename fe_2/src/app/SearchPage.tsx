"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import styles from "./SearchPage.module.css";
import { useSearchParams } from "next/navigation";

interface Perspective {
  id: string;
  title: string;
  source: string;
  community: string;
  quote: string;
  sentiment: number;
  date: string;
  url: string;
}

export default function SearchPage() {
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [isGridView, setIsGridView] = useState(false);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setPerspectives(data);
      } catch (err) {
        console.error("Failed to fetch search results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {loading ? "Loading..." : `Results for "${query}"`}
        </h1>
        <button onClick={() => setIsGridView((prev) => !prev)} className={styles.toggleBtn}>
          {isGridView ? "Card View" : "Grid View"}
        </button>
      </div>

      <div className={isGridView ? styles.gridContainer : styles.cardContainer}>
        {perspectives.map((p) => (
          <Card
            key={p.id}
            title={p.title}
            content={[
              `Source: ${p.source}`,
              `Community: ${p.community}`,
              `Sentiment: ${p.sentiment.toFixed(2)}`,
              `Date: ${new Date(p.date).toLocaleDateString()}`,
              `"${p.quote}"`,
            ]}
            imageUrl={`https://via.placeholder.com/400x200?text=${encodeURIComponent(p.source)}`}
            altText={p.title}
          />
        ))}
      </div>
    </div>
  );
}

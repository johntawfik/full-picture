"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import SearchBar from "@/components/SearchBar";
import styles from "./SearchPage.module.css";
import homeStyles from "./page.module.css";
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
  const [isGridView, setIsGridView] = useState(true);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://full-picture-production.up.railway.app/api/perspectives?query=${encodeURIComponent(query)}`,
          {
            headers: { Accept: "application/json" },
          }
        );
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

  const handleSearch = () => {
    // Search is handled by the SearchBar's router.push now
    // This is just for backward compatibility
  };

  return (
    <div className={styles.page}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 className={`${homeStyles.title} ${homeStyles.expandedFont}`} style={{ marginBottom: '1rem' }}>
          Get the <span className={homeStyles.spanner}>
            Full Picture
            <svg
              className={homeStyles.underline}
              viewBox="0 6 200 40"
              preserveAspectRatio="none"
            >
              <path
                d="M0,20 C50,0 70,40 100,20 
                   C120,10 120,-10 100,5 
                   C90,15 130,35 200,20"
                fill="transparent"
                strokeWidth="2"
              />
            </svg>
          </span>
        </h1>
      </Link>
      <SearchBar showPromptText={true} onSearch={handleSearch} />
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
            id={p.id}
            title={p.title}
            community={p.community}
            sentiment={p.sentiment}
            quote={p.quote}
            url={p.url}
            date={p.date}
          />
        ))}
      </div>
    </div>
  );
}

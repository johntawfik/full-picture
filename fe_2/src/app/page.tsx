"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Card from "@/components/Card";
import SearchBar from "@/components/SearchBar";
import { useRouter } from 'next/navigation';
import { useSearch } from "@/hooks/useSearch";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Link from 'next/link';
import { Article, groupArticlesByLeaning, getPerspectiveColor, PerspectiveLabel } from "@/utils/articleUtils";

export default function Home() {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const didFetch = useRef(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const { setQuery, articles: searchResults, isLoading } = useSearch();

  const fetchHomepage = async () => {
    setRecentArticles([]);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/recent`, {
        headers: { Accept: "application/json" },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setRecentArticles(data);
    } catch (err) {
      console.error(`Error fetching homepage articles:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching articles');
    }
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchHomepage();
  }, [apiUrl]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
       router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const groupedArticles = groupArticlesByLeaning(recentArticles);

  const renderColumn = (articles: Article[]) => {
    return (
      <div className={styles.masonryColumn}>
        {articles.map((article) => (
          <Card
            key={article.id}
            id={article.id}
            title={article.title}
            community={article.community}
            sentiment={article.sentiment}
            quote={article.quote}
            url={article.url}
            date={article.date}
            commentCount={article.comment_count}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <Link href="/about" className={styles.aboutLink}>About</Link>
      <main className={styles.main}>
        <Analytics />
        <SpeedInsights />
        <h1 className={styles.title}>Full Picture</h1>
        <h2 className={styles.subtitle}>See the angles behind every story</h2>
        
        <div className={styles.searchContainer}>
          <SearchBar onSearch={handleSearch} />
        </div>

        {error && (
          <div className={styles.error}>
            Error loading articles: {error}
          </div>
        )}

        {isLoading && (
          <div className={styles.loading}>
            Loading...
          </div>
        )}

        {!isLoading && !error && recentArticles.length > 0 && (
          <div className={styles.articlesGrid}>
            {renderColumn(groupedArticles.left)}
            {renderColumn(groupedArticles.center)}
            {renderColumn(groupedArticles.right)}
          </div>
        )}

        {!isLoading && !error && recentArticles.length === 0 && (
            <p>No recent articles found.</p>
        )}
      </main>
    </div>
  );
}

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

interface Article {
  id: string;
  title: string;
  source: string;
  community: string;
  quote: string;
  sentiment: number;
  date: string;
  url: string;
  comment_count: number;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const groupArticlesByLeaning = (articles: Article[]) => {
  return articles.reduce((acc, article) => {
    const leaning = article.community.toLowerCase();
    if (leaning.includes('left')) {
      acc.left.push(article);
    } else if (leaning.includes('center')) {
      acc.center.push(article);
    } else if (leaning.includes('right')) {
      acc.right.push(article);
    }
    return acc;
  }, { left: [], center: [], right: [] } as { left: Article[]; center: Article[]; right: Article[] });
};

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
      setRecentArticles(shuffleArray(data));
    } catch (err) {
      console.error(`Error fetching homepage articles:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching articles');
    }
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchHomepage();
  }, []);

  // When search results come in, redirect to search page
  useEffect(() => {
    if (searchResults.length > 0) {
      router.push(`/search?q=${encodeURIComponent(searchResults[0].title)}`);
    }
  }, [searchResults, router]);

  const groupedArticles = groupArticlesByLeaning(recentArticles);

  return (
    <div className={styles.page}>
      <Link href="/about" className={styles.aboutLink}>About</Link>
      <main className={styles.main}>
        <Analytics />
        <SpeedInsights />
        <h1 className={styles.title}>Full Picture</h1>
        <h2 className={styles.subtitle}>See the angles behind every story</h2>
        
        <div className={styles.searchContainer}>
          <SearchBar onSearch={setQuery} />
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {isLoading && (
          <div className={styles.loading}>
            Loading...
          </div>
        )}

        <div className={styles.articlesGrid}>
          {recentArticles.map((article) => (
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
      </main>
    </div>
  );
}

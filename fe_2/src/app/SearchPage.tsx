"use client";

import Link from "next/link";
import Card from "@/components/Card";
import SearchBar from "@/components/SearchBar";
import styles from "./SearchPage.module.css";
import homeStyles from "./page.module.css";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { useState, useEffect } from "react";

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

// Add useMediaQuery hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { articles, error, isLoading, setQuery } = useSearch(initialQuery);
  const [layoutMode, setLayoutMode] = useState<'balanced' | 'grouped'>('balanced');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const groupedArticles = groupArticlesByLeaning(articles);

  const renderArticles = () => {
    if (layoutMode === 'grouped') {
      // Find the maximum number of articles in any perspective
      const maxArticles = Math.max(
        groupedArticles.left.length,
        groupedArticles.center.length,
        groupedArticles.right.length
      );

      const getPerspectiveColor = (p: 'Left' | 'Center' | 'Right') => {
        switch (p) {
          case 'Left': return 'blue';
          case 'Center': return 'green';
          case 'Right': return 'red';
          default: return '#00A3BF'; // Default to original color
        }
      };

      const renderColumn = (articles: Article[], perspective: 'Left' | 'Center' | 'Right') => {
        // Don't render anything if there are no articles
        if (articles.length === 0 && layoutMode === 'grouped' && !isDesktop) return null; // Also hide on mobile if grouped and empty

        const perspectiveColor = getPerspectiveColor(perspective);

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
            {/* Only show empty state if we're on desktop and this perspective has fewer articles than max */}
            {articles.length < maxArticles && isDesktop && layoutMode === 'grouped' && (
              <div className={styles.emptyState}>
                <div className={styles.asterisk} style={{ color: perspectiveColor, fontSize: '3.5rem' }}>*</div>
                <h3 className={styles.emptyStateTitle}>No more {perspective.toLowerCase()} perspectives on &apos;{initialQuery}&apos; yet</h3>
                <p className={styles.emptyStateText}>This topic may be underreported or filtered by our sources.</p>
              </div>
            )}
          </div>
        );
      };

      return (
        <div className={styles.articlesGrid} key="grouped">
          {renderColumn(groupedArticles.left, 'Left')}
          {renderColumn(groupedArticles.center, 'Center')}
          {renderColumn(groupedArticles.right, 'Right')}
        </div>
      );
    } else {
      return (
        <div className={styles.balancedGrid} key="balanced">
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
    }
  };

  return (
    <div className={styles.page}>
      <Link href="/about" className={homeStyles.aboutLink}>About</Link>
      <div className={styles.searchContainer}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 className={homeStyles.title} style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            Full Picture
          </h1>
        </Link>
        <p className={styles.subtitle}>See the angles behind every story</p>
        
        <SearchBar initialValue={initialQuery} onSearch={setQuery} />
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

      {initialQuery && (
        <>
          <div className={styles.header}>
            <h2 className={styles.title}>
              Results for &#34;{initialQuery}&#34;
            </h2>
            <div className={styles.layoutToggle}>
              <button
                className={`${styles.toggleButton} ${layoutMode === 'balanced' ? styles.active : ''}`}
                onClick={() => setLayoutMode('balanced')}
              >
                Balanced Layout
              </button>
              <button
                className={`${styles.toggleButton} ${layoutMode === 'grouped' ? styles.active : ''}`}
                onClick={() => setLayoutMode('grouped')}
              >
                Group by Perspective
              </button>
            </div>
          </div>

          <div className={styles.layoutWrapper}>
            {renderArticles()}
          </div>
        </>
      )}
    </div>
  );
}

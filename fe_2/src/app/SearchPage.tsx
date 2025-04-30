"use client";

import Link from "next/link";
import Card from "@/components/Card";
import SearchBar from "@/components/SearchBar";
import styles from "./SearchPage.module.css";
import homeStyles from "./page.module.css";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { useState, useEffect } from "react";
import { Article, groupArticlesByLeaning, getPerspectiveColor, PerspectiveKey, PerspectiveLabel } from "@/utils/articleUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { articles, error, isLoading, setQuery } = useSearch(initialQuery);
  const [layoutMode, setLayoutMode] = useState<'balanced' | 'grouped'>('grouped');
  const [isAboutVisible, setIsAboutVisible] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsAboutVisible(scrollPosition < 100); // Hide after scrolling 100px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const groupedArticles = groupArticlesByLeaning(articles);

  const renderArticles = () => {
    if (layoutMode === 'grouped') {
      const maxArticles = Math.max(
        groupedArticles.left.length,
        groupedArticles.center.length,
        groupedArticles.right.length
      );

      const renderColumn = (
        articles: Article[],
        perspective: PerspectiveLabel,
        allGroupedArticles: { left: Article[]; center: Article[]; right: Article[] },
        globalMaxArticles: number
      ) => {
        if (articles.length === 0 && layoutMode === 'grouped' && !isDesktop) return null;

        const perspectiveColor = getPerspectiveColor(perspective);
        const perspectiveKey = perspective.toLowerCase() as PerspectiveKey;
        let fallbackArticlesToRender: Article[] = [];

        if (articles.length < globalMaxArticles && isDesktop && layoutMode === 'grouped') {
          let fallbackPerspective: PerspectiveLabel | null = null;
          const currentLength = articles.length;

          if (perspective === 'Left') {
            if (allGroupedArticles.center.length > currentLength) {
              fallbackPerspective = 'Center';
            }
          } else if (perspective === 'Right') {
            if (allGroupedArticles.center.length > currentLength) {
              fallbackPerspective = 'Center';
            }
          } else {
            const leftLength = allGroupedArticles.left.length;
            const rightLength = allGroupedArticles.right.length;
            const remainingLeft = leftLength - currentLength;
            const remainingRight = rightLength - currentLength;

            if (remainingRight > 0 && remainingRight >= remainingLeft) {
               fallbackPerspective = 'Right';
            } else if (remainingLeft > 0) {
               fallbackPerspective = 'Left';
            }
          }

          if (fallbackPerspective) {
            const fallbackKey = fallbackPerspective.toLowerCase() as PerspectiveKey;
            const fallbackSourceArticles = allGroupedArticles[fallbackKey];
            fallbackArticlesToRender = fallbackSourceArticles.slice(currentLength);
          }
        }

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

            {articles.length < globalMaxArticles && isDesktop && layoutMode === 'grouped' && articles.length > 0 && (
              <div className={styles.emptyState}>
                <div className={styles.asterisk} style={{ color: perspectiveColor, fontSize: '3.5rem' }}>*</div>
                <h3 className={styles.emptyStateTitle}>No more {perspective.toLowerCase()} perspectives on &apos;{initialQuery}&apos; yet</h3>
                <p className={styles.emptyStateText}>This topic may be underreported or filtered by our sources.</p>
              </div>
            )}

            {fallbackArticlesToRender.map((article) => (
               <Card
                 key={`${article.id}-fallback-${perspectiveKey}`}
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
        <div className={styles.articlesGrid} key="grouped">
          {renderColumn(groupedArticles.left, 'Left', groupedArticles, maxArticles)}
          {renderColumn(groupedArticles.center, 'Center', groupedArticles, maxArticles)}
          {renderColumn(groupedArticles.right, 'Right', groupedArticles, maxArticles)}
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
      <Link href="/about" className={`${styles.aboutLink} ${!isAboutVisible ? styles.hidden : ''}`}>About</Link>
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

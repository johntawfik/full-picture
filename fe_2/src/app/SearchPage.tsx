"use client";

import Link from "next/link";
import Card from "@/components/Card";
import SearchBar from "@/components/SearchBar";
import styles from "./SearchPage.module.css";
import homeStyles from "./page.module.css";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { articles, error, isLoading, setQuery } = useSearch(initialQuery);

  return (
    <div className={styles.page}>
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
              Results for "{initialQuery}"
            </h2>
          </div>

          <div className={styles.articlesGrid}>
            {Array.isArray(articles) && articles.map((article) => (
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
        </>
      )}
    </div>
  );
}

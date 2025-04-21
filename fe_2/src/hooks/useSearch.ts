import { useState, useEffect } from 'react';

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

interface UseSearchResult {
  articles: Article[];
  error: string | null;
  isLoading: boolean;
  setQuery: (query: string) => void;
}

export function useSearch(initialQuery: string = ''): UseSearchResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchArticles = async () => {
      if (!query.trim()) {
        setArticles([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const endpoint = `${apiUrl}/api/perspectives?query=${encodeURIComponent(query)}`;
        const res = await fetch(endpoint, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setArticles(data);
      } catch (err) {
        console.error(`Error fetching articles:`, err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching articles');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchArticles();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, apiUrl]);

  return { articles, error, isLoading, setQuery };
} 
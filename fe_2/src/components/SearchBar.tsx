"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  showPromptText?: boolean;
  onSearch?: (query: string) => void;
}

const prompts = ["China", "Gaza", "Tariffs", "Ukraine"];

export default function SearchBar({ showPromptText = true, onSearch }: SearchBarProps) {
  const [index, setIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [inputText, setInputText] = useState("");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % prompts.length);
        setFadeOut(false);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery === lastSearchedQuery) return;
      
      setLastSearchedQuery(trimmedQuery);
      if (trimmedQuery) {
        // Navigate to search page with query parameter
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        // Still call onSearch if provided (for backward compatibility)
        onSearch?.(trimmedQuery);
      } else {
        onSearch?.("Gaza");
        onSearch?.("China");
        onSearch?.("Tariffs");
        onSearch?.("Ukraine");
      }
    },
    [onSearch, lastSearchedQuery, router]
  );

  // Set up debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(inputText);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputText, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedQuery = inputText.trim();
      if (trimmedQuery !== lastSearchedQuery) {
        setLastSearchedQuery(trimmedQuery);
        if (trimmedQuery) {
          // Navigate to search page with query parameter
          router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
          // Still call onSearch if provided (for backward compatibility)
          onSearch?.(trimmedQuery);
        } else {
          // Reset to homepage when search is empty
          router.push('/');
          onSearch?.("");
        }
      }
    }
  };

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.fakeInput}>
        <input
          type="text"
          className={styles.realInput}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder=""
        />
        {inputText === "" && (
          <span className={styles.fixed}>
            Search up news like{" "}
            {showPromptText && (
              <span className={`${styles.cycle} ${fadeOut ? styles.fadeOut : styles.fadeIn}`}>
                {prompts[index]}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  initialValue?: string;
}

export default function SearchBar({ onSearch, initialValue = "" }: SearchBarProps) {
  const [inputText, setInputText] = useState(initialValue);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedInput = inputText.trim();
      if (trimmedInput) {
        router.push(`/search?q=${encodeURIComponent(trimmedInput)}`);
        onSearch?.(trimmedInput);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputText, router, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedInput = inputText.trim();
      if (trimmedInput) {
        router.push(`/search?q=${encodeURIComponent(trimmedInput)}`);
        onSearch?.(trimmedInput);
      }
    }
  };

  return (
    <div className={styles.searchWrapper}>
      <input
        type="text"
        className={styles.searchInput}
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search a topic (e.g, Gaza, AI, Economy...)"
      />
      <div className={styles.searchIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
            stroke="#666666" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

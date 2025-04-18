"use client";

import { useEffect, useState } from "react";
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputText.trim()) {
      console.log("Searching for:", inputText); // ✅ add this
      onSearch?.(inputText.trim());
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

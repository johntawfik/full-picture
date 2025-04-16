"use client";

import { useEffect, useState } from "react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  showPromptText?: boolean;
}

const prompts = ["dog rescues", "China updates", "beach weather", "US politics"];

export default function SearchBar({ showPromptText = true }: SearchBarProps) {
  const [index, setIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

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

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.fakeInput}>
        <span className={styles.fixed}>
          Search up news like{" "}
          {showPromptText && (
            <span className={`${styles.cycle} ${fadeOut ? styles.fadeOut : styles.fadeIn}`}>
              {prompts[index]}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

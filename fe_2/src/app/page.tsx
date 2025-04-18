"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./page.module.css";
import Card from "@/components/Card";
import SearchBar from "@/components/SearchBar";

interface Perspective {
  id: string;
  title: string;
  source: string;
  community: string;
  quote: string;
  sentiment: number;
  date: string;
  url: string;
}

export default function Home() {
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [query, setQuery] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const apiUrl = process.env.NEXT_PUBLIC_PERSPECTIVES_URL;
  // Update window width on resize and initial load
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const fetchPerspectivesByQuery = async (queries: string[], restrict = true) => {
    setPerspectives([]);
    const seenIds = new Set<string>();
    let fetched: Perspective[] = [];

    for (const q of queries) {
      try {
        const res = await fetch(
          `${apiUrl}${encodeURIComponent(q)}`,
          {
            headers: { Accept: "application/json" },
          }
        );
        const data: Perspective[] = await res.json();

        const toUse = restrict
        ? (() => {
            const perspectivePool: Record<"left" | "right" | "center", Perspective[]> = {
              left: [],
              right: [],
              center: [],
            };
            for (const p of data) {
              const lean = p.community.toLowerCase();
              if (["left", "right", "center"].includes(lean)) {
                perspectivePool[lean as "left" | "right" | "center"].push(p);
              }
            }
            return [
              ...perspectivePool.right.slice(0, 2),
              ...perspectivePool.center.slice(0, 1),
              ...perspectivePool.left.slice(0, 1),
            ];
          })()
        : data;

        for (const p of toUse) {
          if (!seenIds.has(p.id)) {
            fetched.push(p);
            seenIds.add(p.id);
          }
        }
      } catch (err) {
        console.error(`Error fetching for query "${q}"`, err);
      }
    }

    // Ensure we have at least one card
    if (fetched.length === 0) {
      console.warn("No perspectives found for the given queries");
    } else {
      if (windowWidth > 700) {
        const remainder = fetched.length % 3;
        if (remainder !== 0) {
          const cardsNeeded = 3 - remainder;
          fetched = [...fetched, ...fetched.slice(0, cardsNeeded)];
        }
      }
    }

    setPerspectives(fetched);
  };

  const defaultQueries = ["Ukraine", "Gaza", "Tariffs", "China"];

  useEffect(() => {
    fetchPerspectivesByQuery(defaultQueries, true);
  }, []);

  useEffect(() => {
    if (query && query.trim() !== "") {
      fetchPerspectivesByQuery([query], false);
    }
  }, [query]);

  // Refetch when window width changes to adjust card count
  useEffect(() => {
    if (query && query.trim() !== "") {
      fetchPerspectivesByQuery([query], false);
    } else {
      fetchPerspectivesByQuery(defaultQueries, true);
    }
  }, [windowWidth]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={`${styles.title} ${styles.expandedFont}`}>
          Get the <span className={styles.spanner}>
            Full Picture
            <svg
              className={styles.underline}
              viewBox="0 6 200 40"
              preserveAspectRatio="none"
            >
              <path
                d="M0,20 C50,0 70,40 100,20 
                   C120,10 120,-10 100,5 
                   C90,15 130,35 200,20"
                fill="transparent"
                strokeWidth="2"
              />
            </svg>
          </span>
        </h1>
        <SearchBar showPromptText={true} onSearch={(val) => setQuery(val)} />
        <div className={styles.cardGrid}>
          {perspectives.map((p) => (
            <Card
              key={p.id}
              id={p.id}
              title={p.title}
              community={p.community}
              sentiment={p.sentiment}
              quote={p.quote}
              url={p.url}
              date={p.date}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

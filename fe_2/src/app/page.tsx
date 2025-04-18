"use client";

import { useEffect, useState } from "react";
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



  const fetchPerspectivesByQuery = async (queries: string[], restrict = true) => {
    setPerspectives([]);
    const seenIds = new Set<string>();
    const fetched: Perspective[] = [];

    for (const q of queries) {
      try {
        const res = await fetch(
          `https://full-picture-production.up.railway.app/api/perspectives?query=${encodeURIComponent(q)}`,
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
            title={p.title}
            community={p.community}
            sentiment={p.sentiment}
            quote={p.quote}
            url={p.url}
          />
          ))}
        </div>
      </main>
    </div>
  );
}

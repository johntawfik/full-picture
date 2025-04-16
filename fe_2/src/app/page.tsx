"use client";

import { useEffect, useState } from "react";
import { fetchImage } from "@/utils/fetchImage";
import styles from "./page.module.css";
import Card from "@/components/Card";
import SearchBar from "@/components/SearchBar";

const cardData = [
  [1, "Dog", "Title", "Content 1", "Content 2", "Content 3"],
  [2, "Beach", "Title", "Content 1", "Content 2", "Content 3"],
  [3, "USA", "Title", "Content 1", "Content 2", "Content 3"],
  [4, "China", "Title", "Content 1", "Content 2", "Content 3"],
];

export default function Home() {
  const [images, setImages] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchAllImages = async () => {
      const newImages: Record<number, string> = {};
      for (const [id, keyword] of cardData.map(([id, k]) => [id, k])) {
        const url = await fetchImage(keyword as string);
        if (url) newImages[id as number] = url;
      }
      setImages(newImages);
    };

    fetchAllImages();
  }, []);

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
        <SearchBar showPromptText={true} />
        <div className={styles.cardGrid}>
          {cardData.map(([id, img, title, ...content]) => (
            <Card
              key={Number(id)}
              title={String(title) + String(id)}
              imageUrl={images[id as number] || `https://via.placeholder.com/400x200?text=${img}`}
              content={content as Array<string>}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

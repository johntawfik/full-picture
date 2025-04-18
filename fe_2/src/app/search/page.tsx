"use client";

import { Suspense } from "react";
import SearchPage from "../SearchPage";

export default function SearchRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
} 
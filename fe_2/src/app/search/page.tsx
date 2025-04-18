"use client";

import { useSearchParams } from "next/navigation";
import SearchPage from "../SearchPage";

export default function SearchRoute() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  
  return <SearchPage />;
} 
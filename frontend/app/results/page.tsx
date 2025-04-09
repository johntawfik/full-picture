"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { SearchForm } from "@/components/search-form"
import { ResultsGrid } from "@/components/results-grid"
import { ResultsList } from "@/components/results-list"
import { ResultsTimeline } from "@/components/results-timeline"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid")

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <header className="border-b border-[#30363D] bg-[#0D1117]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-[#E6EDF3]">
                Full Picture
              </Link>
              <div className="h-6 w-px bg-[#30363D]" />
              <Link href="/" className="flex items-center gap-1 text-[#8B949E] hover:text-[#C45C28] transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>New search</span>
              </Link>
            </div>
            <div className="w-1/2 max-w-md">
              <SearchForm compact initialValue={query} />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Results for &quot;{query}&quot;</h1>
          <p className="text-[#8B949E]">Showing how different communities are framing this topic</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Perspectives</h2>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="grid">Card View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {viewMode === "grid" && <ResultsGrid query={query} />}
        {viewMode === "list" && <ResultsList query={query} />}
        {viewMode === "timeline" && <ResultsTimeline query={query} />}
      </main>
    </div>
  )
}


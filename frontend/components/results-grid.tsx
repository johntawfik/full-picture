"use client"

import { useState, useEffect } from "react"
import { PerspectiveCard } from "@/components/perspective-card"
import { FilterControls, type CommunityType, type SourceType } from "@/components/filter-controls"
import { getPerspectives, getAvailableSources, filterPerspectives, Perspective } from "@/lib/api"

interface ResultsGridProps {
  query: string
}

export function ResultsGrid({ query }: ResultsGridProps) {
  const [allPerspectives, setAllPerspectives] = useState<Perspective[]>([])
  const [availableSources, setAvailableSources] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<{
    communities: CommunityType[]
    sources: SourceType[]
  }>({
    communities: [],
    sources: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const perspectives = await getPerspectives(query)
        const sources = await getAvailableSources(query)
        
        setAllPerspectives(perspectives)
        setAvailableSources(sources)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load perspectives. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [query])

  const filteredPerspectives = filterPerspectives(allPerspectives, filters)

  return (
    <div className="space-y-6">
      <FilterControls onFilterChange={setFilters} availableSources={availableSources} />

      {isLoading ? (
        <div className="text-center py-12 text-[#8B949E]">
          <p className="text-lg">Loading perspectives...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-[#8B949E]">
          <p className="text-lg">{error}</p>
        </div>
      ) : filteredPerspectives.length === 0 ? (
        <div className="text-center py-12 text-[#8B949E]">
          <p className="text-lg">No perspectives match your current filters.</p>
          <p className="mt-2">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPerspectives.map((perspective) => (
            <PerspectiveCard
              key={perspective.id}
              title={perspective.title}
              source={perspective.source}
              community={perspective.community}
              quote={perspective.quote}
              sentiment={perspective.sentiment}
              date={perspective.date}
              url={perspective.url}
            />
          ))}
        </div>
      )}
    </div>
  )
}


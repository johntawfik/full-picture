"use client"

import { useState } from "react"
import { PerspectiveCard } from "@/components/perspective-card"
import { FilterControls, type CommunityType, type SourceType } from "@/components/filter-controls"
import { getMockPerspectives, getAvailableSources, filterPerspectives } from "@/lib/mock-data"

interface ResultsGridProps {
  query: string
}

export function ResultsGrid({ query }: ResultsGridProps) {
  const allPerspectives = getMockPerspectives(query)
  const availableSources = getAvailableSources(query)

  const [filters, setFilters] = useState<{
    communities: CommunityType[]
    sources: SourceType[]
  }>({
    communities: [],
    sources: [],
  })

  const filteredPerspectives = filterPerspectives(allPerspectives, filters)

  return (
    <div className="space-y-6">
      <FilterControls onFilterChange={setFilters} availableSources={availableSources} />

      {filteredPerspectives.length === 0 ? (
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


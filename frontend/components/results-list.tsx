"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { FilterControls, type CommunityType, type SourceType } from "@/components/filter-controls"
import { getPerspectives, getAvailableSources, filterPerspectives, Perspective } from "@/lib/api"

interface ResultsListProps {
  query: string
}

export function ResultsList({ query }: ResultsListProps) {
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

  const communityColors = {
    left: { bg: "#7C3AED", text: "Left-leaning" }, // Changed from blue to purple
    right: { bg: "#EF4444", text: "Right-leaning" },
    center: { bg: "#9CA3AF", text: "Centrist" },
    international: { bg: "#A855F7", text: "International" },
    social: { bg: "#F59E0B", text: "Social Media" },
  }

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
        <div className="space-y-4">
          {filteredPerspectives.map((perspective) => {
            const sentimentColor =
              perspective.sentiment > 0.3 ? "#10B981" : perspective.sentiment < -0.3 ? "#EF4444" : "#9CA3AF"

            const sentimentWidth = `${Math.abs(perspective.sentiment) * 100}%`
            const sentimentPosition = perspective.sentiment >= 0 ? "left" : "right"

            return (
              <Card key={perspective.id} className="bg-[#161B22] border-[#30363D] overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/4">
                      <Badge style={{ backgroundColor: communityColors[perspective.community].bg }} className="mb-2">
                        {communityColors[perspective.community].text}
                      </Badge>
                      <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1">{perspective.title}</h3>
                      <p className="text-sm text-[#8B949E] mb-2">{perspective.source}</p>
                      <div className="text-xs text-[#8B949E] mb-4">{perspective.date}</div>

                      <div className="relative mb-4 h-1 bg-[#30363D] rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 h-full rounded-full"
                          style={{
                            backgroundColor: sentimentColor,
                            width: sentimentWidth,
                            [sentimentPosition]: 0,
                          }}
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-[#30363D] text-[#C45C28] hover:bg-[#30363D]/50 hover:text-[#C45C28]"
                        onClick={() => window.open(perspective.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Source
                      </Button>
                    </div>

                    <div className="md:w-3/4">
                      <blockquote className="text-[#E6EDF3] italic">{perspective.quote}</blockquote>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}


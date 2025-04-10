"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterControls, type CommunityType, type SourceType } from "@/components/filter-controls"
import { getTimelinePerspectives, getAvailableSources, TimelinePerspective, Perspective } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

interface ResultsTimelineProps {
  query: string
}

export function ResultsTimeline({ query }: ResultsTimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelinePerspective[]>([])
  const [availableSources, setAvailableSources] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")

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
        const timeline = await getTimelinePerspectives(query)
        const sources = await getAvailableSources(query)
        
        setTimelineData(timeline)
        setAvailableSources(sources)
        
        // Set the first date as selected if available
        if (timeline.length > 0) {
          setSelectedDate(timeline[0].date)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load timeline. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [query])

  const communityColors = {
    left: { bg: "#7C3AED", text: "Left-leaning" }, // Changed from blue to purple
    right: { bg: "#EF4444", text: "Right-leaning" },
    center: { bg: "#9CA3AF", text: "Centrist" },
    international: { bg: "#A855F7", text: "International" },
    social: { bg: "#F59E0B", text: "Social Media" },
  }

  const selectedDateData = timelineData.find((item) => item.date === selectedDate)

  // Filter perspectives based on selected filters
  const filteredPerspectives = selectedDateData
    ? selectedDateData.perspectives.filter((perspective) => {
        const communityMatch = filters.communities.length === 0 || filters.communities.includes(perspective.community)
        const sourceMatch = filters.sources.length === 0 || filters.sources.includes(perspective.source)
        return communityMatch && sourceMatch
      })
    : []

  return (
    <div className="space-y-6">
      <FilterControls onFilterChange={setFilters} availableSources={availableSources} />

      {isLoading ? (
        <div className="text-center py-12 text-[#8B949E]">
          <p className="text-lg">Loading timeline...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-[#8B949E]">
          <p className="text-lg">{error}</p>
        </div>
      ) : timelineData.length === 0 ? (
        <div className="text-center py-12 text-[#8B949E]">
          <p className="text-lg">No timeline data available for this query.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <Tabs value={selectedDate} onValueChange={setSelectedDate}>
              <TabsList className="bg-[#161B22]">
                {timelineData.map((item) => (
                  <TabsTrigger key={item.date} value={item.date} className="data-[state=active]:bg-[#30363D]">
                    {item.date}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredPerspectives.length === 0 ? (
                <div className="text-center py-12 text-[#8B949E]">
                  <p className="text-lg">No perspectives match your current filters for this date.</p>
                  <p className="mt-2">Try adjusting your filters or selecting a different date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPerspectives.map((perspective) => {
                    const sentimentColor =
                      perspective.sentiment > 0.3 ? "#10B981" : perspective.sentiment < -0.3 ? "#EF4444" : "#9CA3AF"

                    const sentimentWidth = `${Math.abs(perspective.sentiment) * 100}%`
                    const sentimentPosition = perspective.sentiment >= 0 ? "left" : "right"

                    return (
                      <Card key={perspective.id} className="bg-[#161B22] border-[#30363D] overflow-hidden">
                        <CardContent className="p-6">
                          <Badge style={{ backgroundColor: communityColors[perspective.community].bg }} className="mb-2">
                            {communityColors[perspective.community].text}
                          </Badge>
                          <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1">{perspective.title}</h3>
                          <p className="text-sm text-[#8B949E] mb-4">{perspective.source}</p>

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

                          <blockquote className="text-[#E6EDF3] italic">{perspective.quote}</blockquote>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  )
}


"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function TrendingTopics() {
  const router = useRouter()

  const trendingTopics = [
    { id: 1, name: "Gaza" },
    { id: 2, name: "TikTok ban" },
    { id: 3, name: "Climate protests" },
    { id: 4, name: "AI regulation" },
    { id: 5, name: "Inflation" },
  ]

  const handleTopicClick = (topic: string) => {
    router.push(`/results?q=${encodeURIComponent(topic)}`)
  }

  return (
    <div className="mt-8">
      <p className="text-[#8B949E] mb-3">Trending topics</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {trendingTopics.map((topic) => (
          <Button
            key={topic.id}
            variant="outline"
            onClick={() => handleTopicClick(topic.name)}
            className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D] hover:text-[#E6EDF3] transition-colors"
          >
            {topic.name}
          </Button>
        ))}
      </div>
    </div>
  )
}


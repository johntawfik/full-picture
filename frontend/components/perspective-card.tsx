"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"

interface PerspectiveCardProps {
  title: string
  source: string
  community: "left" | "right" | "center" | "international" | "social"
  quote: string
  sentiment: number // -1 to 1
  date: string
  url: string
}

export function PerspectiveCard({ title, source, community, quote, sentiment, date, url }: PerspectiveCardProps) {
  const [expanded, setExpanded] = useState(false)

  const communityColors = {
    left: { bg: "#7C3AED", text: "Left-leaning" }, // Changed from blue to purple
    right: { bg: "#EF4444", text: "Right-leaning" },
    center: { bg: "#9CA3AF", text: "Centrist" },
    international: { bg: "#A855F7", text: "International" },
    social: { bg: "#F59E0B", text: "Social Media" },
  }

  const sentimentColor = sentiment > 0.3 ? "#10B981" : sentiment < -0.3 ? "#EF4444" : "#9CA3AF"

  const sentimentWidth = `${Math.abs(sentiment) * 100}%`
  const sentimentPosition = sentiment >= 0 ? "left" : "right"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full bg-[#161B22] border-[#30363D] overflow-hidden flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge style={{ backgroundColor: communityColors[community].bg }} className="mb-2">
              {communityColors[community].text}
            </Badge>
            <span className="text-xs text-[#8B949E]">{date}</span>
          </div>
          <h3 className="text-lg font-semibold text-[#E6EDF3]">{title}</h3>
          <p className="text-sm text-[#8B949E]">{source}</p>
        </CardHeader>
        <CardContent className="flex-grow">
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
          <div className="relative">
            <blockquote className="text-[#E6EDF3] italic">
              {expanded ? quote : `${quote.substring(0, 150)}${quote.length > 150 ? "..." : ""}`}
            </blockquote>
            {quote.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-[#C45C28] hover:text-[#C45C28] hover:bg-[#30363D]/50 p-0 h-auto flex items-center gap-1"
              >
                {expanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Read more</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#30363D] text-[#C45C28] hover:bg-[#30363D]/50 hover:text-[#C45C28]"
            onClick={() => window.open(url, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Source
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}


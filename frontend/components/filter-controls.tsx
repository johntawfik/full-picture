"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export type CommunityType = "left" | "right" | "center" | "international" | "social"
export type SourceType = string

interface FilterControlsProps {
  onFilterChange: (filters: {
    communities: CommunityType[]
    sources: SourceType[]
  }) => void
  availableSources: SourceType[]
}

export function FilterControls({ onFilterChange, availableSources }: FilterControlsProps) {
  const [selectedCommunities, setSelectedCommunities] = useState<CommunityType[]>([])
  const [selectedSources, setSelectedSources] = useState<SourceType[]>([])

  const communityOptions: { value: CommunityType; label: string }[] = [
    { value: "left", label: "Left-leaning" },
    { value: "right", label: "Right-leaning" },
    { value: "center", label: "Centrist" },
    { value: "international", label: "International" },
    { value: "social", label: "Social Media" },
  ]

  const handleCommunityChange = (community: CommunityType) => {
    setSelectedCommunities((prev) => {
      const newSelection = prev.includes(community) ? prev.filter((c) => c !== community) : [...prev, community]

      onFilterChange({
        communities: newSelection,
        sources: selectedSources,
      })

      return newSelection
    })
  }

  const handleSourceChange = (source: SourceType) => {
    setSelectedSources((prev) => {
      const newSelection = prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]

      onFilterChange({
        communities: selectedCommunities,
        sources: newSelection,
      })

      return newSelection
    })
  }

  const clearFilters = () => {
    setSelectedCommunities([])
    setSelectedSources([])
    onFilterChange({ communities: [], sources: [] })
  }

  const hasActiveFilters = selectedCommunities.length > 0 || selectedSources.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="border-[#30363D] bg-[#161B22] text-[#E6EDF3] hover:bg-[#30363D] hover:text-[#E6EDF3]"
          >
            <Filter className="h-4 w-4 mr-2" />
            Political Affiliation
            <ChevronDown className="h-4 w-4 ml-2" />
            {selectedCommunities.length > 0 && (
              <Badge className="ml-2 bg-[#C45C28]">{selectedCommunities.length}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-4 bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
          <div className="space-y-4">
            <h4 className="font-medium">Filter by affiliation</h4>
            <div className="space-y-2">
              {communityOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`community-${option.value}`}
                    checked={selectedCommunities.includes(option.value)}
                    onCheckedChange={() => handleCommunityChange(option.value)}
                    className="data-[state=checked]:bg-[#C45C28] data-[state=checked]:border-[#C45C28]"
                  />
                  <Label htmlFor={`community-${option.value}`} className="text-[#E6EDF3] cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="border-[#30363D] bg-[#161B22] text-[#E6EDF3] hover:bg-[#30363D] hover:text-[#E6EDF3]"
          >
            <Filter className="h-4 w-4 mr-2" />
            Sources
            <ChevronDown className="h-4 w-4 ml-2" />
            {selectedSources.length > 0 && <Badge className="ml-2 bg-[#C45C28]">{selectedSources.length}</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-4 bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
          <div className="space-y-4">
            <h4 className="font-medium">Filter by source</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {availableSources.map((source) => (
                <div key={source} className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-${source}`}
                    checked={selectedSources.includes(source)}
                    onCheckedChange={() => handleSourceChange(source)}
                    className="data-[state=checked]:bg-[#C45C28] data-[state=checked]:border-[#C45C28]"
                  />
                  <Label htmlFor={`source-${source}`} className="text-[#E6EDF3] cursor-pointer">
                    {source}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-[#C45C28] hover:text-[#C45C28] hover:bg-[#30363D]/50"
        >
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}

      <div className="flex flex-wrap gap-1 ml-2">
        {selectedCommunities.map((community) => {
          const label = communityOptions.find((opt) => opt.value === community)?.label
          return (
            <Badge key={community} variant="outline" className="bg-[#30363D]/50 text-[#E6EDF3] border-[#30363D]">
              {label}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleCommunityChange(community)} />
            </Badge>
          )
        })}

        {selectedSources.map((source) => (
          <Badge key={source} variant="outline" className="bg-[#30363D]/50 text-[#E6EDF3] border-[#30363D]">
            {source}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleSourceChange(source)} />
          </Badge>
        ))}
      </div>
    </div>
  )
}


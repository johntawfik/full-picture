"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchFormProps {
  compact?: boolean
  initialValue?: string
}

export function SearchForm({ compact = false, initialValue = "" }: SearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialValue)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsAnimating(true)
    setTimeout(() => {
      router.push(`/results?q=${encodeURIComponent(query.trim())}`)
      setIsAnimating(false)
    }, 300)
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${isAnimating ? "animate-pulse" : ""}`}>
      <div className={`relative ${compact ? "" : "shadow-lg"}`}>
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="h-5 w-5 text-[#8B949E]" />
        </div>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={compact ? "Search a topic..." : "How is 'Ukraine' being framed?"}
          className={`pl-12 pr-24 py-6 bg-[#161B22] border-[#30363D] text-[#E6EDF3] placeholder:text-[#8B949E] focus:border-[#C45C28] focus:ring-[#C45C28] ${
            compact ? "h-10 text-sm" : "h-14 text-lg rounded-xl"
          }`}
        />
        <Button
          type="submit"
          className={`absolute right-2 ${
            compact ? "top-1 h-8 text-sm" : "top-2 h-10"
          } bg-[#C45C28] hover:bg-[#C45C28]/90 text-white`}
        >
          Search
        </Button>
      </div>
    </form>
  )
}


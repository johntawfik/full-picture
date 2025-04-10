// Types
export type Community = "left" | "right" | "center" | "international" | "social"

export interface Perspective {
  id: string
  title: string
  source: string
  community: Community
  quote: string
  sentiment: number // -1 to 1
  date: string
  url: string
}

export interface TimelinePerspective {
  date: string
  perspectives: Perspective[]
}

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Fetch perspectives from the API
export async function getPerspectives(query: string): Promise<Perspective[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/perspectives?query=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching perspectives:', error)
    // Return empty array on error
    return []
  }
}

// Fetch timeline perspectives from the API
export async function getTimelinePerspectives(query: string): Promise<TimelinePerspective[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/timeline?query=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching timeline perspectives:', error)
    // Return empty array on error
    return []
  }
}

// Fetch available sources from the API
export async function getAvailableSources(query: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sources?query=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching sources:', error)
    // Return empty array on error
    return []
  }
}

// Filter perspectives based on selected filters
export function filterPerspectives(
  perspectives: Perspective[],
  filters: {
    communities: Community[]
    sources: string[]
  },
): Perspective[] {
  const { communities, sources } = filters

  // If no filters are selected, return all perspectives
  if (communities.length === 0 && sources.length === 0) {
    return perspectives
  }

  return perspectives.filter((perspective) => {
    const communityMatch = communities.length === 0 || communities.includes(perspective.community)
    const sourceMatch = sources.length === 0 || sources.includes(perspective.source)
    return communityMatch && sourceMatch
  })
} 
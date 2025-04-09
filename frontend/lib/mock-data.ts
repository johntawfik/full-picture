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

interface TimelinePerspective {
  date: string
  perspectives: Perspective[]
}

// Helper function to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9)

// Mock data generator for perspectives
export function getMockPerspectives(query: string): Perspective[] {
  // This would be replaced with actual API calls in a real application

  const mockData: Record<string, Perspective[]> = {
    default: [
      {
        id: generateId(),
        title: "The Truth About This Topic",
        source: "Progressive News Network",
        community: "left",
        quote:
          "This issue represents a fundamental shift in how we approach social equity and justice. Experts agree that the progressive approach offers the most comprehensive solution to address the underlying systemic issues.",
        sentiment: 0.7,
        date: "Apr 5, 2023",
        url: "https://example.com/article1",
      },
      {
        id: generateId(),
        title: "A Balanced Perspective",
        source: "Centrist Daily",
        community: "center",
        quote:
          "While there are valid points on both sides of this debate, the data suggests a moderate approach may yield the most practical results. We must consider both the economic and social implications before making policy decisions.",
        sentiment: 0.1,
        date: "Apr 6, 2023",
        url: "https://example.com/article2",
      },
      {
        id: generateId(),
        title: "The Real Story",
        source: "Conservative Tribune",
        community: "right",
        quote:
          "This policy would have devastating consequences for hardworking Americans. The traditional approach has proven effective for generations, and abandoning it now would be a costly mistake that undermines our core values.",
        sentiment: -0.6,
        date: "Apr 4, 2023",
        url: "https://example.com/article3",
      },
      {
        id: generateId(),
        title: "Global Implications",
        source: "International Observer",
        community: "international",
        quote:
          "From an international perspective, this issue reflects broader global trends. Many countries have already implemented similar measures with varying degrees of success, offering valuable lessons for policymakers.",
        sentiment: 0.3,
        date: "Apr 7, 2023",
        url: "https://example.com/article4",
      },
      {
        id: generateId(),
        title: "What People Are Saying",
        source: "r/Politics",
        community: "social",
        quote:
          "The online discussion has been heated, with many users expressing strong opinions. 'This is either the best or worst thing that could happen,' wrote one popular commenter, reflecting the polarized nature of the debate.",
        sentiment: -0.2,
        date: "Apr 8, 2023",
        url: "https://example.com/article5",
      },
      {
        id: generateId(),
        title: "Economic Analysis",
        source: "Financial Review",
        community: "center",
        quote:
          "Our economic models suggest mixed outcomes depending on implementation. While short-term costs may be significant, long-term benefits could outweigh these if properly managed and with appropriate oversight mechanisms in place.",
        sentiment: 0.2,
        date: "Apr 9, 2023",
        url: "https://example.com/article6",
      },
    ],

    gaza: [
      {
        id: generateId(),
        title: "Humanitarian Crisis Deepens",
        source: "Progressive Globe",
        community: "left",
        quote:
          "The humanitarian situation in Gaza has reached catastrophic levels, with civilians bearing the brunt of the conflict. International aid organizations are calling for an immediate ceasefire and unrestricted humanitarian access to address the growing crisis of food insecurity, lack of medical supplies, and displacement.",
        sentiment: -0.8,
        date: "Apr 3, 2023",
        url: "https://example.com/gaza1",
      },
      {
        id: generateId(),
        title: "Security Concerns Remain Primary",
        source: "National Security Review",
        community: "right",
        quote:
          "The ongoing military operation in Gaza is a necessary response to terrorist activities that threatened civilian populations. Security experts emphasize that dismantling terrorist infrastructure is essential for long-term regional stability and protecting innocent lives on both sides of the conflict.",
        sentiment: -0.3,
        date: "Apr 4, 2023",
        url: "https://example.com/gaza2",
      },
      {
        id: generateId(),
        title: "Diplomatic Efforts Intensify",
        source: "Global Affairs Monitor",
        community: "center",
        quote:
          "Mediators are working around the clock to broker a sustainable ceasefire agreement. The complex negotiations involve multiple stakeholders with divergent interests, but diplomatic sources report progress on key issues including hostage releases, humanitarian aid delivery, and security arrangements.",
        sentiment: 0.2,
        date: "Apr 5, 2023",
        url: "https://example.com/gaza3",
      },
      {
        id: generateId(),
        title: "Regional Implications Expand",
        source: "Middle East Observer",
        community: "international",
        quote:
          "The Gaza conflict has triggered wider regional tensions, with neighboring countries increasingly drawn into the crisis. Analysts warn of a potential domino effect that could destabilize the entire Middle East, as proxy forces mobilize and diplomatic relations deteriorate between key regional powers.",
        sentiment: -0.6,
        date: "Apr 6, 2023",
        url: "https://example.com/gaza4",
      },
      {
        id: generateId(),
        title: "Voices from the Ground",
        source: "Twitter Trends",
        community: "social",
        quote:
          "Social media has become a crucial window into the reality of life in Gaza, with residents documenting their daily struggles amid the conflict. Hashtags like #GazaVoices and #CeasefireNow are trending globally, as personal stories cut through political narratives and highlight the human cost of the ongoing violence.",
        sentiment: -0.7,
        date: "Apr 7, 2023",
        url: "https://example.com/gaza5",
      },
      {
        id: generateId(),
        title: "Economic Impact Assessment",
        source: "Development Economics Institute",
        community: "center",
        quote:
          "The destruction of infrastructure in Gaza will require billions in reconstruction aid and decades of recovery. Beyond the immediate humanitarian needs, economists point to the long-term development challenges, including rebuilding essential services, restoring livelihoods, and addressing psychological trauma in a population that has endured multiple cycles of conflict.",
        sentiment: -0.5,
        date: "Apr 8, 2023",
        url: "https://example.com/gaza6",
      },
    ],

    "tiktok ban": [
      {
        id: generateId(),
        title: "Digital Rights at Risk",
        source: "Tech Freedom Journal",
        community: "left",
        quote:
          "The proposed TikTok ban represents a dangerous precedent for government control over digital platforms. Civil liberties experts warn that targeting a specific app based on its country of origin rather than specific violations opens the door to broader censorship and undermines principles of net neutrality and free expression online.",
        sentiment: -0.6,
        date: "Apr 2, 2023",
        url: "https://example.com/tiktok1",
      },
      {
        id: generateId(),
        title: "National Security Imperative",
        source: "Homeland Security Review",
        community: "right",
        quote:
          "The TikTok ban is a necessary step to protect American data from foreign surveillance. Intelligence officials have repeatedly warned about the app's connections to the Chinese government and the potential for user data to be accessed by foreign entities, creating significant national security vulnerabilities that cannot be ignored.",
        sentiment: 0.5,
        date: "Apr 3, 2023",
        url: "https://example.com/tiktok2",
      },
      {
        id: generateId(),
        title: "Economic and Business Impact",
        source: "Business Analytics Today",
        community: "center",
        quote:
          "A TikTok ban would have complex economic implications, affecting not just the platform itself but an entire ecosystem of creators, marketers, and businesses that have built livelihoods around the app. Market analysts estimate potential losses in the billions, while also acknowledging legitimate security concerns that need to be addressed through regulation.",
        sentiment: -0.2,
        date: "Apr 4, 2023",
        url: "https://example.com/tiktok3",
      },
      {
        id: generateId(),
        title: "Global Tech Regulation Trends",
        source: "International Digital Policy Institute",
        community: "international",
        quote:
          "The U.S. debate over TikTok reflects a global struggle to balance national security with open digital markets. Many countries are developing their own approaches to regulating foreign tech platforms, creating a fragmented international landscape that challenges the original vision of a borderless internet.",
        sentiment: 0.1,
        date: "Apr 5, 2023",
        url: "https://example.com/tiktok4",
      },
      {
        id: generateId(),
        title: "Creator Community Responds",
        source: "r/TikTokCreators",
        community: "social",
        quote:
          "The potential ban has sent shockwaves through the creator community, with many expressing anxiety about losing their primary platform and income source. 'I built my entire business on TikTok over three years,' wrote one popular creator. 'Where do we go if it disappears overnight? This isn't just an app, it's our livelihood.'",
        sentiment: -0.7,
        date: "Apr 6, 2023",
        url: "https://example.com/tiktok5",
      },
      {
        id: generateId(),
        title: "Technical Solutions Proposed",
        source: "Tech Policy Center",
        community: "center",
        quote:
          "Technology experts suggest that data security concerns could be addressed through technical solutions rather than an outright ban. Proposals include data localization requirements, independent security audits, and transparent algorithms, potentially creating a framework for responsible operation of international platforms in sensitive markets.",
        sentiment: 0.4,
        date: "Apr 7, 2023",
        url: "https://example.com/tiktok6",
      },
    ],

    "climate protests": [
      {
        id: generateId(),
        title: "Youth Movement Gains Momentum",
        source: "Environmental Justice Network",
        community: "left",
        quote:
          "The climate protests represent a powerful intergenerational movement for environmental justice. Young activists are demanding immediate action on climate change, highlighting the moral imperative to protect future generations from the worst impacts of a crisis they did not create but will inherit.",
        sentiment: 0.7,
        date: "Apr 1, 2023",
        url: "https://example.com/climate1",
      },
      {
        id: generateId(),
        title: "Economic Concerns Take Center Stage",
        source: "Industry Observer",
        community: "right",
        quote:
          "While climate concerns are legitimate, the radical demands of protesters would impose devastating costs on working families and businesses. Economic analysts warn that an accelerated transition away from conventional energy sources without adequate alternatives in place risks energy insecurity and economic hardship.",
        sentiment: -0.5,
        date: "Apr 2, 2023",
        url: "https://example.com/climate2",
      },
      {
        id: generateId(),
        title: "Public Opinion Shifts",
        source: "Public Policy Institute",
        community: "center",
        quote:
          "Recent polling shows growing public support for climate action, though disagreements remain about pace and methods. The visibility of climate protests has contributed to increased awareness, with 68% of respondents now ranking climate change as a 'very serious' or 'somewhat serious' threat, up from 52% three years ago.",
        sentiment: 0.3,
        date: "Apr 3, 2023",
        url: "https://example.com/climate3",
      },
      {
        id: generateId(),
        title: "Global Movement, Local Impacts",
        source: "International Climate Monitor",
        community: "international",
        quote:
          "Climate protests have taken different forms across countries, reflecting local contexts and priorities. In the Global South, demonstrations often emphasize climate justice and the disproportionate impacts on vulnerable communities, while in industrialized nations, the focus frequently turns to policy change and corporate accountability.",
        sentiment: 0.2,
        date: "Apr 4, 2023",
        url: "https://example.com/climate4",
      },
      {
        id: generateId(),
        title: "Debate Over Tactics Intensifies",
        source: "Twitter Trends",
        community: "social",
        quote:
          "Social media is divided over protest tactics, with disruptive actions drawing both support and criticism. 'Civil disobedience is necessary when conventional channels have failed,' argues one viral post, while others counter that alienating potential allies through extreme methods undermines the broader goal of building consensus for climate action.",
        sentiment: -0.1,
        date: "Apr 5, 2023",
        url: "https://example.com/climate5",
      },
      {
        id: generateId(),
        title: "Policy Impact Assessment",
        source: "Governance Studies Center",
        community: "center",
        quote:
          "Research on social movements suggests that the climate protests are influencing policy discussions, though the relationship between street activism and policy change is complex. Case studies indicate that protests are most effective when combined with institutional advocacy, expert input, and practical policy alternatives.",
        sentiment: 0.4,
        date: "Apr 6, 2023",
        url: "https://example.com/climate6",
      },
    ],
  }

  // Return specific mock data if available, otherwise return default
  return mockData[query.toLowerCase()] || mockData["default"]
}

// Get all unique sources from the mock data
export function getAvailableSources(query: string): string[] {
  const perspectives = getMockPerspectives(query)
  const sources = perspectives.map((p) => p.source)
  return [...new Set(sources)]
}

// Mock data generator for timeline perspectives
export function getMockTimelinePerspectives(query: string): TimelinePerspective[] {
  // This would be replaced with actual API calls in a real application

  // Generate dates for the past week
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }).reverse()

  // Generate perspectives for each date
  return dates.map((date) => {
    return {
      date,
      perspectives: Array.from({ length: 3 }, (_, i) => {
        const communities: Community[] = ["left", "center", "right"]
        return {
          id: generateId(),
          title: `Perspective on ${query} - ${date}`,
          source: `Source ${i + 1}`,
          community: communities[i],
          quote: `This is a perspective on "${query}" from ${date}. The narrative evolves over time as new developments occur and different aspects of the story gain prominence in public discourse.`,
          sentiment: Math.random() * 2 - 1, // Random sentiment between -1 and 1
          date,
          url: "https://example.com/article",
        }
      }),
    }
  })
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


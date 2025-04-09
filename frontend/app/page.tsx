import Link from "next/link"
import { SearchForm } from "@/components/search-form"
import { TrendingTopics } from "@/components/trending-topics"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0D1117] text-[#E6EDF3]">
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#E6EDF3]">
            Full Picture
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors">
              About
            </Link>
            <Link href="/methodology" className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors">
              Methodology
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            See the <span className="text-[#C45C28]">full picture</span>
          </h1>
          <p className="text-xl text-[#8B949E]">Discover how different communities frame the same story</p>
          <SearchForm />
          <TrendingTopics />
        </div>
      </main>
      <footer className="container mx-auto py-6 text-center text-[#8B949E]">
        <p>© {new Date().getFullYear()} Full Picture. All rights reserved.</p>
      </footer>
    </div>
  )
}


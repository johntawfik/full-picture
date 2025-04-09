import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <header className="border-b border-[#30363D] bg-[#0D1117]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#E6EDF3]">
              Full Picture
            </Link>
            <div className="h-6 w-px bg-[#30363D] mx-4" />
            <Link href="/" className="flex items-center gap-1 text-[#8B949E] hover:text-[#E6EDF3] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-[#E6EDF3]">Our Methodology</h1>

          <div className="space-y-8 text-[#E6EDF3]">
            <p className="text-xl text-[#8B949E] mb-12">
              Full Picture uses a comprehensive approach to analyze how different communities frame and discuss the same
              topics. Here's how we do it.
            </p>

            <Card className="bg-[#161B22] border-[#30363D] mb-8">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Data Collection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6EDF3]">
                <p>
                  We gather content from a diverse range of sources across the political and social spectrum, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Major news publications and their opinion sections</li>
                  <li>Political commentary from various ideological perspectives</li>
                  <li>Social media discussions and trending hashtags</li>
                  <li>International news sources for global context</li>
                  <li>Academic and policy publications</li>
                </ul>
                <p>
                  Our collection process uses both automated systems and human curation to ensure comprehensive coverage
                  while maintaining quality control.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#161B22] border-[#30363D] mb-8">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Content Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6EDF3]">
                <p>We classify content sources along several dimensions:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Political Leaning:</strong> Based on established media bias charts, editorial positions, and
                    content analysis
                  </li>
                  <li>
                    <strong>Source Type:</strong> News organization, opinion platform, social media, academic source,
                    etc.
                  </li>
                  <li>
                    <strong>Geographic Origin:</strong> To distinguish between domestic and international perspectives
                  </li>
                </ul>
                <p>
                  Our classification system is regularly reviewed by a diverse panel of media experts to minimize our
                  own biases and ensure fair representation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#161B22] border-[#30363D] mb-8">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Analysis Techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6EDF3]">
                <p>We employ several analytical methods to understand how different communities frame topics:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Natural Language Processing:</strong> To identify key phrases, sentiment, and narrative
                    patterns
                  </li>
                  <li>
                    <strong>Sentiment Analysis:</strong> To measure emotional tone and evaluative language
                  </li>
                  <li>
                    <strong>Frame Analysis:</strong> To identify how issues are contextualized and what aspects are
                    emphasized or omitted
                  </li>
                  <li>
                    <strong>Temporal Analysis:</strong> To track how narratives evolve over time
                  </li>
                </ul>
                <p>
                  Our algorithms are designed to highlight substantive differences in framing rather than merely
                  detecting partisan language.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#161B22] border-[#30363D] mb-8">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Limitations and Transparency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6EDF3]">
                <p>We acknowledge several limitations in our approach:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    No classification system can perfectly capture the complexity of political and social viewpoints
                  </li>
                  <li>Our coverage is limited by language (primarily English) and accessibility of sources</li>
                  <li>Automated analysis cannot capture all nuances of human communication</li>
                  <li>Despite our best efforts, our own biases may influence our methodology</li>
                </ul>
                <p>
                  We are committed to transparency about these limitations and continuously refine our methods based on
                  feedback and emerging best practices.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#161B22] border-[#30363D]">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Our Commitment to Neutrality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#E6EDF3]">
                <p>
                  Full Picture is committed to political neutrality in our presentation of different perspectives. We:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Do not rank or evaluate the validity of different viewpoints</li>
                  <li>Present all perspectives with equal prominence in our interface</li>
                  <li>Use neutral design elements and language in our platform</li>
                  <li>Maintain a diverse team with varied political viewpoints</li>
                  <li>Regularly audit our system for unintended bias</li>
                </ul>
                <p>
                  Our goal is to help users understand different perspectives, not to guide them toward any particular
                  conclusion.
                </p>
              </CardContent>
            </Card>

            <div className="mt-12 text-center">
              <p className="text-[#8B949E]">Have questions about our methodology or suggestions for improvement?</p>
              <Link
                href="/contact"
                className="inline-block mt-2 px-4 py-2 rounded-md bg-[#C45C28] text-white hover:bg-[#C45C28]/90 transition-colors"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto py-6 text-center text-[#8B949E]">
        <p>© {new Date().getFullYear()} Full Picture. All rights reserved.</p>
      </footer>
    </div>
  )
}


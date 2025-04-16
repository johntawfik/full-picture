import { Suspense } from "react";

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() || "";

  // Simulated server-side fetch
  const results = await getSearchResults(query);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Search results for: <em>{query}</em></h1>
      {results.length > 0 ? (
        <ul>
          {results.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </main>
  );
}

// Simulated server function (replace with DB/API call)
async function getSearchResults(query: string): Promise<string[]> {
  // Fake data for now
  const sample = {
    China: ["China's economy rebounds", "New trade talks with China"],
    Gaza: ["Ceasefire in Gaza", "International response grows"],
    Tariffs: ["New tariffs on tech", "Tariff negotiations ongoing"],
    Ukraine: ["Frontline updates", "NATO support for Ukraine"],
  };

  await new Promise((res) => setTimeout(res, 300)); // simulate network delay

  return sample[query as keyof typeof sample] || [];
}

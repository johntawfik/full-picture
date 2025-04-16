// utils/fetchImage.ts
export async function fetchImage(keyword: string): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${keyword}&orientation=landscape&per_page=1`,
      {
        headers: {
          Authorization: apiKey || '',
        },
      }
    );
  
    if (!res.ok) return null;
  
    const data = await res.json();
    return data.photos?.[0]?.src?.landscape || null; // landscape is typically ~1280x850
  }
  
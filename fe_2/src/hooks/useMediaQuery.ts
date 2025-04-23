import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR compatibility)
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    // Set initial state
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Use addEventListener and removeEventListener for modern compatibility
    media.addEventListener('change', listener);

    // Cleanup function
    return () => media.removeEventListener('change', listener);
  }, [matches, query]); // Dependencies: re-run effect if query or matches state changes

  return matches;
} 
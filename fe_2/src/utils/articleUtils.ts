// Define the Article interface if it's not globally available
// Assuming it might be needed here or imported elsewhere
export interface Article {
  id: string;
  title: string;
  source: string;
  community: string;
  quote: string;
  sentiment: number;
  date: string;
  url: string;
  comment_count: number;
}

export const groupArticlesByLeaning = (articles: Article[]) => {
  return articles.reduce((acc, article) => {
    const leaning = article.community.toLowerCase();
    if (leaning.includes('left')) {
      acc.left.push(article);
    } else if (leaning.includes('center')) {
      acc.center.push(article);
    } else if (leaning.includes('right')) {
      acc.right.push(article);
    }
    // Optionally handle articles that don't match any category
    // else { acc.other.push(article); }
    return acc;
  }, { left: [], center: [], right: [] } as { left: Article[]; center: Article[]; right: Article[] /*; other: Article[]*/ });
};

export type PerspectiveKey = 'left' | 'center' | 'right';
export type PerspectiveLabel = 'Left' | 'Center' | 'Right';

export const getPerspectiveColor = (p: PerspectiveLabel) => {
  switch (p) {
    case 'Left': return '#007bff'; // Blue
    case 'Center': return '#28a745'; // Green
    case 'Right': return '#dc3545'; // Red
    default: return '#6c757d'; // Default grey or another color
  }
}; 
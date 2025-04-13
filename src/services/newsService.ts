import axios from 'axios';

export interface Article {
  title: string;
  url: string;
  image: string;
  date: string;
}

// Fallback news data
const fallbackNews = [
  {
    title: 'Nowe trendy na rynku nieruchomości w 2025 roku',
    url: 'https://example.com/article1',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80',
    date: new Date().toISOString()
  },
  {
    title: 'Jak zmiany stóp procentowych wpłyną na rynek nieruchomości',
    url: 'https://example.com/article2',
    image: 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?auto=format&fit=crop&q=80',
    date: new Date().toISOString()
  },
  {
    title: 'Najlepsze lokalizacje inwestycyjne w Polsce w 2025',
    url: 'https://example.com/article3',
    image: 'https://images.unsplash.com/photo-1560518883-b414ea083a38?auto=format&fit=crop&q=80',
    date: new Date().toISOString()
  }
];

export const newsService = {
  async getLatestNews(): Promise<Article[]> {
    try {
      // Return fallback data directly instead of making an API call
      return fallbackNews;
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return fallback data in case of error
      return fallbackNews;
    }
  }
};
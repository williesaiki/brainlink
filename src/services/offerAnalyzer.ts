// /var/www/tea/frontend/src/services/offerAnalyzer.ts
export interface SimilarOffer {
  link: string;
  price: number | null;
  area: number | null;
  rooms: number | null;
  price_per_m2: number | null;
  floor: string | null;
  location: string;
  image: string;
}

export interface AnalysisResult {
  search_url: string;
  base_offer: {
    price: number | null;
    area: number | null;
    rooms: number | null;
    location: string;
  };
  similar_offers: SimilarOffer[];
}

const API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';  // Zastąp swoim kluczem API

export const offerAnalyzer = {
  async analyzeOffer(url: string): Promise<AnalysisResult> {
    try {
      const response = await fetch('https://hub.theestate.pl/api/analyze-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,  // Dodaj klucz API do nagłówka
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      return data;
    } catch (error) {
      console.error('Błąd podczas analizy oferty:', error);
      throw error;
    }
  },
};
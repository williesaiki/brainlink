import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Sparkles } from 'lucide-react';
import { colors } from '../../../config/colors';
import { toast } from 'sonner';

interface SimilarOffer {
  link: string;
  price: number | null;
  area: number | null;
  rooms: number | null;
  price_per_m2: number | null;
  floor: string | null;
  location: string;
  image: string;
}

interface AnalysisResult {
  search_url: string;
  base_offer: {
    price: number | null;
    area: number | null;
    rooms: number | null;
    location: string;
  };
  similar_offers: SimilarOffer[];
}

function OfferAnalysis() {
  const [offerUrl, setOfferUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyzeOffer = async () => {
    if (!offerUrl) {
      toast.error('Wprowadź URL oferty');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('https://hub.theestate.pl/api/analyze-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        },
        body: JSON.stringify({ url: offerUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze offer');
      }

      const result = await response.json();
      setAnalysisResult(result);
      toast.success('Analiza zakończona pomyślnie');
    } catch (error) {
      console.error('Error analyzing offer:', error);
      toast.error('Nie udało się przeanalizować oferty');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Analiza ofert</h1>

        <div className={`${colors.card.stats} p-6 rounded-lg mb-8`}>
          <h2 className="text-xl font-semibold text-white mb-6">Analiza oferty</h2>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                value={offerUrl}
                onChange={(e) => setOfferUrl(e.target.value)}
                placeholder="Wklej link do oferty..."
                className={`w-full ${colors.form.input} pl-10`}
              />
            </div>
            <button
              onClick={handleAnalyzeOffer}
              disabled={isAnalyzing}
              className={`${colors.button.primary} px-6 rounded-lg flex items-center gap-2 min-w-[140px] justify-center`}
            >
              {isAnalyzing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analizuj
                </>
              )}
            </button>
          </div>
        </div>

        {analysisResult && (
          <div className={`${colors.card.stats} p-6 rounded-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">Podobne oferty</h3>
              <a
                href={analysisResult.search_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <LinkIcon className="w-4 h-4" />
                Zobacz w Otodom
              </a>
            </div>

            <div className="space-y-4">
              {analysisResult.similar_offers.map((offer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${colors.card.stats} p-4 rounded-lg`}
                >
                  <div className="flex gap-4">
                    <img
                      src={offer.image}
                      alt={offer.location}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">{offer.location}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-gray-400">
                          Cena: {offer.price?.toLocaleString()} PLN
                        </div>
                        <div className="text-gray-400">
                          Powierzchnia: {offer.area} m²
                        </div>
                        <div className="text-gray-400">
                          Pokoje: {offer.rooms}
                        </div>
                        <div className="text-gray-400">
                          Cena/m²: {offer.price_per_m2?.toLocaleString()} PLN
                        </div>
                      </div>
                    </div>
                    <a
                      href={offer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors self-center"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OfferAnalysis;
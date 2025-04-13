import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  RefreshCw,
  FileText,
  BarChart2,
  CheckCircle,
  XCircle,
  Clock8,
  Quote,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { newsService, Article } from '../../services/newsService';
import { currencyService, CurrencyRate } from '../../services/currencyService';
import { colors } from '../../config/colors';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { estateApi } from '../../services/estateApi';
import OfficeAnnouncements from './OfficeAnnouncements';
import { createSampleAnnouncement } from '../../utils/createSampleData';

function Overview() {
  const navigate = useNavigate();
  const [news, setNews] = useState<Article[]>([]);
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offerStats, setOfferStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [quoteOfDay, setQuoteOfDay] = useState({
    text: "Wszystko, czego kiedykolwiek pragnąłeś, znajduje się po drugiej stronie strachu.",
    author: "George Addair",
  });

  useEffect(() => {
    fetchData();
    
    // Create sample announcement for demonstration
    createSampleAnnouncement();

    // Refresh rates every 5 minutes
    const interval = setInterval(
      () => {
        refreshRates();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Get news data
      const newsData = await newsService.getLatestNews();
      setNews(newsData);
      
      // Get currency rates
      try {
        const ratesData = await currencyService.getRates();
        setRates(ratesData);
      } catch (ratesError) {
        console.error("Error fetching rates:", ratesError);
        // Set fallback rates
        setRates([
          { code: 'EUR', rate: 4.3215, change: 0.12 },
          { code: 'USD', rate: 3.9876, change: -0.23 },
          { code: 'GBP', rate: 5.1234, change: 0.05 },
          { code: 'CHF', rate: 4.4567, change: -0.08 }
        ]);
      }
      
      // Get offers data
      try {
        const offersData = await estateApi.getOffers();
        
        // Calculate offer statistics
        const stats = {
          total: offersData.length,
          pending: offersData.filter((o) => o.status === "pending").length || 2,
          accepted: offersData.filter((o) => o.status === "accepted").length || 5,
          rejected: offersData.filter((o) => o.status === "rejected").length || 1,
        };
        
        setOfferStats(stats);
      } catch (offersError) {
        console.error("Error fetching offers:", offersError);
        // Set fallback stats
        setOfferStats({
          total: 8,
          pending: 2,
          accepted: 5,
          rejected: 1,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRates = async () => {
    try {
      setIsRefreshing(true);
      // Set fallback rates
      setRates([
        { code: 'EUR', rate: 4.3215 + (Math.random() * 0.02 - 0.01), change: 0.12 + (Math.random() * 0.1 - 0.05) },
        { code: 'USD', rate: 3.9876 + (Math.random() * 0.02 - 0.01), change: -0.23 + (Math.random() * 0.1 - 0.05) },
        { code: 'GBP', rate: 5.1234 + (Math.random() * 0.02 - 0.01), change: 0.05 + (Math.random() * 0.1 - 0.05) },
        { code: 'CHF', rate: 4.4567 + (Math.random() * 0.02 - 0.01), change: -0.08 + (Math.random() * 0.1 - 0.05) }
      ]);
    } catch (error) {
      console.error("Error refreshing rates:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000008] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Panel Zarządzania</h1>
          <button
            onClick={refreshRates}
            className="bg-[#0e1326] hover:bg-[#0e1326]/80 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Odśwież
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Quote of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0e1326] rounded-xl p-6 mb-8 border border-[#0e1326]"
        >
          <div className="flex items-start gap-4">
            <Quote className="w-8 h-8 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-lg text-white italic">{quoteOfDay.text}</p>
              <p className="text-gray-400 mt-2">— {quoteOfDay.author}</p>
            </div>
          </div>
        </motion.div>

        {/* Office Announcements - Full width */}
        <div className="mb-8">
          <OfficeAnnouncements />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Currency Rates */}
          <div className="bg-[#0e1326] rounded-xl p-6 border border-[#0e1326]">
            <h2 className="text-xl font-semibold text-white mb-6">
              Kursy walut
            </h2>
            <div className="space-y-4">
              {rates.map((rate) => (
                <div
                  key={rate.code}
                  className="flex items-center justify-between p-3 bg-[#1c2543] rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">
                      {rate.code}/PLN
                    </div>
                    <div
                      className={`text-sm ${rate.change >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {rate.change >= 0 ? "+" : ""}
                      {rate.change.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {rate.rate.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Articles */}
          <div className="bg-[#0e1326] rounded-xl p-6 lg:col-span-2 border border-[#0e1326]">
            <h2 className="text-xl font-semibold text-white mb-6">
              Najnowsze artykuły
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {news.length > 0 ? (
                news.map((article, index) => (
                  <motion.a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-[#1c2543] rounded-lg hover:bg-[#1c2543]/80 transition-all duration-200"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {format(new Date(article.date), "dd MMM yyyy, HH:mm", {
                          locale: pl,
                        })}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </motion.a>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Brak najnowszych artykułów
                </div>
              )}
            </div>
          </div>

          {/* Offer Statistics */}
          <div className="bg-[#0e1326] rounded-xl p-6 border border-[#0e1326]">
            <h2 className="text-xl font-semibold text-white mb-6">
              Twoje Oferty
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#1c2543] rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Wszystkie</span>
                </div>
                <span className="text-xl font-bold text-white">
                  {offerStats.total}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1c2543] rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock8 className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Oczekujące</span>
                </div>
                <span className="text-xl font-bold text-white">
                  {offerStats.pending}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1c2543] rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Zaakceptowane</span>
                </div>
                <span className="text-xl font-bold text-white">
                  {offerStats.accepted}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1c2543] rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-white">Odrzucone</span>
                </div>
                <span className="text-xl font-bold text-white">
                  {offerStats.rejected}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0e1326] rounded-xl p-6 lg:col-span-2 border border-[#0e1326]">
            <h2 className="text-xl font-semibold text-white mb-6">
              Ostatnia aktywność
            </h2>
            <div className="space-y-4">
              {[
                {
                  text: "Nowa oferta została dodana",
                  time: "2 godziny temu",
                  icon: FileText,
                },
                {
                  text: "Zaktualizowano status oferty",
                  time: "4 godziny temu",
                  icon: CheckCircle,
                },
                {
                  text: "Nowy artykuł opublikowany",
                  time: "5 godzin temu",
                  icon: MessageSquare,
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-[#1c2543] rounded-lg"
                >
                  <div className="p-2 bg-[#0e1326] rounded-lg">
                    <activity.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{activity.text}</p>
                    <p className="text-sm text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
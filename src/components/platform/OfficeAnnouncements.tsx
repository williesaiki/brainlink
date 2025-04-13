import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { colors } from '../../config/colors';
import { Announcement } from '../../lib/firebase';
import { announcementService } from '../../services/announcementService';
import { auth } from '../../lib/firebase';
import { toast } from 'sonner';

function OfficeAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setError('Nie udało się pobrać ogłoszeń biura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      const success = await announcementService.markAsRead(announcementId);
      if (success) {
        setAnnouncements(prev => 
          prev.map(announcement => 
            announcement.id === announcementId 
              ? { 
                  ...announcement, 
                  readBy: [...announcement.readBy, currentUser?.uid || ''] 
                }
              : announcement
          )
        );
      }
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      toast.error('Nie udało się oznaczyć ogłoszenia jako przeczytane');
    }
  };

  const isRead = (announcement: Announcement) => {
    return announcement.readBy.includes(currentUser?.uid || '');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="bg-[#0e1326] rounded-xl p-6 border border-[#0e1326] overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Ogłoszenia biura</h2>
        </div>
        <button
          onClick={fetchAnnouncements}
          className="bg-[#0e1326] hover:bg-[#0e1326]/80 border border-gray-800 p-2 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        ) : announcements.length > 0 ? (
          announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#1c2543] p-4 rounded-lg border ${isRead(announcement) ? 'border-gray-800/30' : 'border-gray-600/50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority === 'high' ? 'Ważne' : 
                     announcement.priority === 'medium' ? 'Średnie' : 'Informacja'}
                  </span>
                  <h3 className={`font-medium ${isRead(announcement) ? 'text-gray-400' : 'text-white'}`}>
                    {announcement.title}
                  </h3>
                </div>
                {!isRead(announcement) && (
                  <div className="bg-blue-500 w-2 h-2 rounded-full"></div>
                )}
              </div>
              
              <p className={`text-sm mb-3 ${isRead(announcement) ? 'text-gray-500' : 'text-gray-400'}`}>
                {announcement.content}
              </p>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {new Date(announcement.createdAt).toLocaleDateString('pl-PL', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                
                {!isRead(announcement) ? (
                  <button
                    onClick={() => handleMarkAsRead(announcement.id)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Oznacz jako przeczytane</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Check className="w-4 h-4" />
                    <span>Przeczytane</span>
                  </span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            Brak ogłoszeń do wyświetlenia
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficeAnnouncements;
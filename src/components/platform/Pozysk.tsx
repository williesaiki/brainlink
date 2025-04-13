import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Link,
  Search,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Save,
  Building2,
  MapPin,
  Home,
  DoorOpen,
  Calendar,
  Wifi,
  Droplets,
  Flame,
  Zap,
  Plus,
  X,
  ChevronRight,
  FileText,
  Clock,
  Tag
} from 'lucide-react';
import { colors } from '../../config/colors';
import { offerService, Offer } from '../../services/offerService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function Pozysk() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setIsLoading(true);
      const drafts = await offerService.getOffers('draft');
      setDrafts(drafts);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Nie udało się pobrać wersji roboczych');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    try {
      toast.loading('Tworzenie nowego draftu...');
      
      toast.loading('Tworzenie nowego pozysku...');
      
      // Create a new draft offer
      const newDraft = await offerService.createOffer({
        title: 'Nowa oferta',
        description: '',
        price: 0,
        location: '',
        area: 0,
        rooms: 0,
        media: {
          internet: false,
          water: false,
          gas: false,
          electricity: false
        },
        images: [],
        status: 'draft',
        agent_id: 'current-user',
        agent_name: 'Current User',
        agent_email: 'user@example.com',
        agent_phone: '+48 123 456 789'
      });

      // Navigate to edit the new draft
      toast.dismiss();
      toast.success('Utworzono nowy draft');
      toast.dismiss();
      toast.success('Utworzono nowy pozysk');
      navigate(`/platform/pozysk/${newDraft.id}`);
    } catch (error) {
      console.error('Error navigating to new draft:', error);
      toast.dismiss();
      toast.error('Nie udało się utworzyć nowego pozysku');
    }
  };

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Pozysk</h1>
          <button 
            onClick={handleCreateDraft}
            className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors`}
          >
            <Plus className="w-5 h-5" />
            Utwórz draft
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj pozysków..."
              className={`w-full ${colors.form.search} py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500`}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="text-center text-gray-400 mt-8 p-8 border border-gray-800 rounded-lg">
            Brak pozysków. Weź się do roboty!
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrafts.map((draft) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${colors.card.stats} p-6 rounded-lg hover:border-gray-700 transition-all duration-200 cursor-pointer`}
                onClick={() => navigate(`/platform/pozysk/${draft.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{draft.title}</h3>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                        Draft
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-400 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{draft.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        <span>{draft.area} m²</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{draft.price.toLocaleString()} PLN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(draft.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/platform/pozysk/${draft.id}/analysis`);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      Analiza oferty
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Pozysk;
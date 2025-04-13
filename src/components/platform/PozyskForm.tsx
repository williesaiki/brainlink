import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Link as LinkIcon,
  ChevronLeft,
  Trash2,
  Sparkles,
  Save,
  Building2,
  MapPin,
  Home,
  DoorOpen,
  Calendar,
  Upload,
  X,
  Image as ImageIcon,
  ArrowRight,
  Wand2
} from 'lucide-react';
import { colors } from '../../config/colors';
import { offerService, Offer } from '../../services/offerService'; 
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LocationSearch from './LocationSearch';

function PozyskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerUrl, setOfferUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [images, setImages] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    area: '',
    rooms: '',
    buildingYear: '',
    floor: '',
    media: {
      internet: false,
      water: false,
      gas: false,
      electricity: false
    }
  });

  useEffect(() => {
    if (id) {
      loadOffer();
    }
  }, [id]);

  const loadOffer = async () => {
    try {
      const offer = await offerService.getOffer(id);
      if (offer) {
        setFormData({
          title: offer.title,
          description: offer.description,
          price: offer.price.toString(),
          location: offer.location,
          area: offer.area.toString(),
          rooms: offer.rooms.toString(),
          buildingYear: offer.buildingYear?.toString() || '',
          floor: offer.floor?.toString() || '',
          media: offer.media
        });
        setImages(offer.images || []);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania oferty:', error);
      toast.error('Nie udało się załadować oferty');
    }
  };

  const validateForm = () => {
    const requiredFields = {
      title: 'tytuł',
      price: 'cenę',
      location: 'lokalizację',
      area: 'powierzchnię'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      const missingFieldsText = missingFields.join(', ');
      toast.error(`Proszę uzupełnić wymagane pola: ${missingFieldsText}`);
      return false;
    }
    return true;
  };

  const handleCreateDraft = async () => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const offerData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        location: formData.location,
        area: formData.area ? parseFloat(formData.area) : 0,
        rooms: formData.rooms ? parseInt(formData.rooms) : 0,
        buildingYear: formData.buildingYear ? parseInt(formData.buildingYear) : 0,
        floor: formData.floor ? parseInt(formData.floor) : 0,
        media: formData.media,
        images: images,
        status: 'draft',
        agent_id: 'current-user',
        agent_name: 'Current User',
        agent_email: 'user@example.com',
        agent_phone: '+48 123 456 789'
      };

      if (id) {
        await offerService.updateOffer(id, offerData);
        toast.success('Zapisano zmiany w pozysku');
      } else {
        await offerService.createOffer(offerData);
        toast.success('Utworzono nowy pozysk');
        setTimeout(() => navigate('/platform/pozysk'), 1500);
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania pozysku:', error);
      toast.error('Nie udało się zapisać pozysku');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await offerService.deleteOffer(id);
      toast.success('Pozysk został usunięty');
      navigate('/platform/pozysk');
    } catch (error) {
      console.error('Błąd podczas usuwania pozysku:', error);
      toast.error('Nie udało się usunąć pozysku');
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!offerUrl) {
      toast.error('Wprowadź adres URL oferty');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:5000/api/analyze-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: offerUrl }),
      });

      if (!response.ok) throw new Error('Błąd analizy oferty');

      const result = await response.json();
      setAnalysisResult(result);

      setFormData({
        title: `Mieszkanie ${result.base_offer.rooms}-pokojowe, ${result.base_offer.area}m²`,
        description: `Mieszkanie o powierzchni ${result.base_offer.area}m² w lokalizacji ${result.base_offer.location}.`,
        price: result.base_offer.price.toString(),
        location: result.base_offer.location,
        area: result.base_offer.area.toString(),
        rooms: result.base_offer.rooms.toString(),
        buildingYear: '',
        floor: '',
        media: { internet: false, water: false, gas: false, electricity: false }
      });

      toast.success('Analiza zakończona pomyślnie');
    } catch (error) {
      console.error('Błąd podczas analizy oferty:', error);
      toast.error('Nie udało się przeanalizować oferty');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(images[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      images.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleImproveDescription = async () => {
    if (!formData.description) {
      toast.error('Najpierw dodaj opis');
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const improvedDescription = 'Zachwycające, przestronne mieszkanie w prestiżowej lokalizacji. ' + 
        'Nieruchomość wyróżnia się doskonałym układem pomieszczeń, wysokim standardem wykończenia ' +
        'oraz panoramicznymi oknami zapewniającymi naturalne oświetlenie przez cały dzień...';
      setFormData(prev => ({ ...prev, description: improvedDescription }));
      toast.success('Opis został ulepszony przez AI');
    } catch (error) {
      console.error('Błąd podczas ulepszania opisu:', error);
      toast.error('Nie udało się ulepszyć opisu');
    }
  };

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => navigate('/platform/pozysk')}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Powrót do listy pozysków
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            {id ? 'Edycja pozysku' : 'Nowy pozysk'}
          </h1>
          <button
            onClick={() => toast.success('Oferta została dodana do Esti')}
            className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2`}
          >
            <ArrowRight className="w-5 h-5" />
            Dodaj do Esti
          </button>
        </div>

        <div className={`${colors.card.stats} p-6 rounded-lg`}>
          <h2 className="text-xl font-semibold text-white mb-6">Analiza oferty</h2>
          <div className="flex gap-4 mb-6">
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
              onClick={handleAnalyzeUrl}
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

          {analysisResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-2">Wyniki analizy</h3>
              <div className="flex justify-between items-center">
                <h4 className="text-gray-400">Podobne oferty w okolicy:</h4>
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
              <div className="space-y-3">
                {analysisResult.similar_offers.map((offer, index) => (
                  <div key={index} className={`${colors.card.stats} p-4 rounded-lg`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white">{offer.location}</p>
                        <p className="text-gray-400">
                          {offer.price?.toLocaleString()} PLN • {offer.area}m² • {offer.rooms} pok.
                        </p>
                        {offer.price_per_m2 && (
                          <p className="text-gray-500 text-sm">
                            {offer.price_per_m2.toLocaleString()} PLN/m²
                          </p>
                        )}
                      </div>
                      <a
                        href={offer.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Zobacz
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`${colors.card.stats} p-6 rounded-lg`}>
          <h2 className="text-xl font-semibold text-white mb-6">Szczegóły oferty</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={colors.form.label}>Tytuł</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={colors.form.input}
                  placeholder="Tytuł oferty"
                />
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Lokalizacja</label>
                <LocationSearch
                  initialValue={formData.location}
                  onLocationSelect={(location) => setFormData({ ...formData, location: location.address })}
                />
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Cena (PLN)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={colors.form.input}
                  placeholder="Cena"
                />
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Powierzchnia (m²)</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className={`${colors.form.input} pl-10`}
                    placeholder="Powierzchnia"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Liczba pokoi</label>
                <div className="relative">
                  <DoorOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    className={`${colors.form.input} pl-10`}
                    placeholder="Liczba pokoi"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Rok budowy</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.buildingYear}
                    onChange={(e) => setFormData({ ...formData, buildingYear: e.target.value })}
                    className={`${colors.form.input} pl-10`}
                    placeholder="Rok budowy"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className={colors.form.label}>Opis</label>
                <button
                  onClick={handleImproveDescription}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm"
                >
                  <Wand2 className="w-4 h-4" />
                  Ulepsz z AI
                </button>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${colors.form.textarea} w-full h-40`}
                placeholder="Opis nieruchomości..."
              />
            </div>

            <div className="space-y-2">
              <label className={colors.form.label}>Media</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(formData.media).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFormData({
                        ...formData,
                        media: { ...formData.media, [key]: e.target.checked }
                      })}
                      className="form-checkbox h-5 w-5 text-blue-500"
                    />
                    <span className="text-gray-400 capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className={colors.form.label}>Zdjęcia</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Zdjęcie ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                <label className={`${colors.card.stats} aspect-square flex flex-col items-center justify-center cursor-pointer rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">Dodaj zdjęcia</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          {id && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className={`${colors.button.secondary} text-red-500 hover:text-red-400 px-6 py-3 rounded-lg flex items-center gap-2`}
            >
              <Trash2 className="w-5 h-5" />
              Usuń
            </button>
          )}
          <button
            onClick={handleCreateDraft}
            disabled={isSubmitting}
            className={`${colors.button.primary} px-8 py-3 rounded-lg flex items-center gap-2`}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Save className="w-5 h-5" />
                {id ? 'Zapisz zmiany' : 'Utwórz draft'}
              </>
            )}
          </button>
        </div>

        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.modal.container} max-w-md w-full mx-4 p-6 rounded-xl`}>
              <div className="flex items-center gap-2 text-red-500 mb-4">
                <Trash2 className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Usuń pozysk</h2>
              </div>
              <p className="text-gray-400 mb-6">
                Czy na pewno chcesz usunąć ten pozysk? Tej operacji nie można cofnąć.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className={`${colors.button.secondary} px-4 py-2 rounded-lg`}
                >
                  Anuluj
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PozyskForm;
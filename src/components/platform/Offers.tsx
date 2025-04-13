import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  RefreshCw, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Phone,
  Mail,
  MapPin,
  Home,
  DoorOpen,
  Wifi,
  Droplets,
  Flame,
  Zap,
  Users2,
  UserMinus,
  AlertTriangle,
  StickyNote, 
  Maximize2,
  UserPlus,
  Building2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { estateApi, type EstateOffer } from '../../services/estateApi';
import { offerService, type Offer } from '../../services/offerService';
import { Client } from '../../lib/firebase';
import { clientsService } from '../../lib/clientsService';
import Select from 'react-select';
import PropertyViewingForm from './PropertyViewingForm';
import { toast } from 'sonner';
import { colors } from '../../config/colors';

const locationOptions = [
  { value: 'mokotow', label: 'Mokotów' },
  { value: 'zoliborz', label: 'Żoliborz' },
  { value: 'ursynow', label: 'Ursynów' },
  { value: 'wola', label: 'Wola' },
  { value: 'srodmiescie', label: 'Śródmieście' }
];

function Offers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<EstateOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<EstateOffer | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [error, setError] = useState('');
  const [showEnlargedImage, setShowEnlargedImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
    type: 'buyer' as 'buyer' | 'seller',
    locations: [] as string[],
    price_min: '',
    price_max: '',
    tags: [] as string[]
  });
  const [showViewingForm, setShowViewingForm] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const data = await estateApi.getOffers();
      setOffers(data);
      setError('');
    } catch (error) {
      console.error('Błąd podczas pobierania ofert:', error);
      setError('Nie udało się pobrać ofert');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfferClick = async (offer: EstateOffer) => {
    try {
      const details = await estateApi.getOfferDetails(offer.id);
      if (details) {
        setSelectedOffer(details);
        setCurrentImageIndex(0);
        try {
          const clients = await clientsService.getClientsForOffer(offer.id.toString());
          setAssignedClients(clients);
        } catch (err) {
          console.error('Błąd podczas pobierania przypisanych klientów:', err);
          toast.error('Nie udało się pobrać przypisanych klientów');
        }
      }
    } catch (error) {
      console.error('Błąd podczas pobierania szczegółów oferty:', error);
      toast.error('Nie udało się pobrać szczegółów oferty');
    }
  };

  const fetchAvailableClients = async () => {
    try {
      const clients = await clientsService.getClients();
      setAvailableClients(clients);
    } catch (err) {
      console.error('Błąd podczas pobierania klientów:', err);
      setError('Nie udało się pobrać listy klientów');
    }
  };

  const handleAddClients = async () => {
    if (!selectedOffer) return;
    
    try {
      await Promise.all(
        selectedClients.map(clientId =>
          clientsService.addClientToOffer(clientId, selectedOffer.id.toString())
        )
      );
      
      const updatedClients = await clientsService.getClientsForOffer(selectedOffer.id.toString());
      setAssignedClients(updatedClients);
      
      setShowClientsModal(false);
      setSelectedClients([]);
      toast.success('Przypisano klientów do oferty');
    } catch (err) {
      console.error('Błąd podczas przypisywania klientów:', err);
      toast.error('Nie udało się przypisać klientów do oferty');
    }
  };

  const handleCreateClient = async () => {
    if (!selectedOffer) return;
    setIsSubmitting(true);

    try {
      const clientData = {
        ...newClient,
        price_min: newClient.price_min ? parseFloat(newClient.price_min) : null,
        price_max: newClient.price_max ? parseFloat(newClient.price_max) : null,
        client_type: newClient.type
      };

      const client = await clientsService.createClient(clientData);
      await clientsService.addClientToOffer(client.id, selectedOffer.id.toString());
      
      const updatedClients = await clientsService.getClientsForOffer(selectedOffer.id.toString());
      setAssignedClients(updatedClients);
      
      setShowNewClientModal(false);
      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        notes: '',
        type: 'buyer',
        locations: [],
        price_min: '',
        price_max: '',
        tags: []
      });
      
      toast.success('Utworzono i przypisano nowego klienta');
    } catch (err) {
      console.error('Błąd podczas tworzenia klienta:', err);
      toast.error('Nie udało się utworzyć klienta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveClient = async (clientId: string) => {
    if (!selectedOffer) return;
    
    try {
      await clientsService.removeClientFromOffer(clientId, selectedOffer.id.toString());
      setAssignedClients(assignedClients.filter(client => client.id !== clientId));
      toast.success('Klient został usunięty z oferty');
    } catch (err) {
      console.error('Błąd podczas usuwania klienta z oferty:', err);
      toast.error('Nie udało się usunąć klienta z oferty');
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const nextImage = () => {
    if (selectedOffer?.pictures) {
      setCurrentImageIndex((prev) => 
        prev === selectedOffer.pictures.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedOffer?.pictures) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedOffer.pictures.length - 1 : prev - 1
      );
    }
  };

  const filteredOffers = offers.filter(offer => 
    offer.portalTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.locationCityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.locationPrecinctName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (showClientsModal) {
      fetchAvailableClients();
    }
  }, [showClientsModal]);

  if (selectedOffer) {
    return (
      <div className="p-8 bg-[#000008] min-h-screen">
        <button
          onClick={() => setSelectedOffer(null)}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Powrót do listy ofert
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-video relative rounded-xl overflow-hidden">
              <img
                src={selectedOffer.pictures[currentImageIndex]}
                alt={selectedOffer.portalTitle}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowEnlargedImage(true)}
              />
              {selectedOffer.pictures.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
              <button
                onClick={() => setShowEnlargedImage(true)}
                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {selectedOffer.pictures.map((pic, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index ? 'border-gray-400' : 'border-transparent'
                  }`}
                >
                  <img src={pic} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Offer Details */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-white">{selectedOffer.portalTitle}</h1>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowNewClientModal(true)}
                  className={`${colors.button.secondary} p-2 rounded-lg`}
                  title="Dodaj nowego klienta"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowClientsModal(true)}
                  className={`${colors.button.secondary} p-2 rounded-lg`}
                  title="Przypisz klientów"
                >
                  <Users2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowViewingForm(true)}
                  className={`${colors.button.secondary} p-2 rounded-lg`}
                  title="Zaplanuj prezentację"
                >
                  <CalendarIcon className="w-5 h-5" />
                </button>
                <button className={`${colors.button.secondary} p-2 rounded-lg`}>
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-400">
                {new Intl.NumberFormat('pl-PL', {
                  style: 'currency',
                  currency: 'PLN'
                }).format(parseFloat(selectedOffer.price))}
              </span>
              <button className={`${colors.button.secondary} px-3 py-1 rounded-lg text-sm`}>
                Edytuj cenę
              </button>
            </div>

            {/* Assigned Clients Section */}
            <div className={`${colors.card.stats} p-4 rounded-lg`}>
              <h3 className="text-white font-medium mb-3">Przypisani klienci</h3>
              <div className="space-y-3">
                {assignedClients.map(client => (
                  <div
                    key={client.id}
                    className={`${colors.card.stats} p-3 rounded-lg flex items-center justify-between`}
                  >
                    <div>
                      <p className="text-white">{client.first_name} {client.last_name}</p>
                      <p className="text-sm text-gray-400">{client.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveClient(client.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {assignedClients.length === 0 && (
                  <p className="text-gray-400 text-center">Brak przypisanych klientów</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`${colors.card.stats} p-4 rounded-lg`}>
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Home className="w-5 h-5" />
                  <span>Powierzchnia</span>
                </div>
                <span className="text-white font-medium">{selectedOffer.areaTotal} m²</span>
              </div>
              <div className={`${colors.card.stats} p-4 rounded-lg`}>
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <DoorOpen className="w-5 h-5" />
                  <span>Pokoje</span>
                </div>
                <span className="text-white font-medium">{selectedOffer.apartmentRoomNumber || 'b/d'}</span>
              </div>
              <div className={`${colors.card.stats} p-4 rounded-lg`}>
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Rok budowy</span>
                </div>
                <span className="text-white font-medium">{selectedOffer.buildingYear || 'b/d'}</span>
              </div>
              <div className={`${colors.card.stats} p-4 rounded-lg`}>
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span>Piętro</span>
                </div>
                <span className="text-white font-medium">{selectedOffer.apartmentFloor || 'b/d'}</span>
              </div>
            </div>

            <div className={`${colors.card.stats} p-4 rounded-lg`}>
              <h3 className="text-white font-medium mb-3">Media</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`flex items-center gap-2 ${selectedOffer.mediaInternet ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Wifi className="w-5 h-5" />
                  <span>Internet</span>
                </div>
                <div className={`flex items-center gap-2 ${selectedOffer.mediaWater ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Droplets className="w-5 h-5" />
                  <span>Woda</span>
                </div>
                <div className={`flex items-center gap-2 ${selectedOffer.mediaGas ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Flame className="w-5 h-5" />
                  <span>Gaz</span>
                </div>
                <div className={`flex items-center gap-2 ${selectedOffer.mediaCurrent ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Zap className="w-5 h-5" />
                  <span>Prąd</span>
                </div>
              </div>
            </div>

            <div className={`${colors.card.stats} p-4 rounded-lg`}>
              <h3 className="text-white font-medium mb-3">Lokalizacja</h3>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{selectedOffer.locationCityName}, {selectedOffer.locationPrecinctName}</span>
              </div>
            </div>

            <div className={`${colors.card.stats} p-4 rounded-lg`}>
              <h3 className="text-white font-medium mb-3">Opis</h3>
              <div 
                className="text-gray-400"
                dangerouslySetInnerHTML={{ __html: selectedOffer.description }}
              />
            </div>

            <div className={`${colors.card.stats} p-4 rounded-lg`}>
              <h3 className="text-white font-medium mb-3">Kontakt</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{selectedOffer.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{selectedOffer.contactEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Clients Modal */}
        {showClientsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.modal.container} p-6 w-full max-w-md`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Dodaj klientów do oferty</h2>
                <button 
                  onClick={() => setShowClientsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                {availableClients.map(client => (
                  <div
                    key={client.id}
                    className={`${colors.card.stats} p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedClients.includes(client.id)
                        ? 'border-gray-400'
                        : 'hover:border-gray-400/50'
                    }`}
                    onClick={() => toggleClientSelection(client.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-medium">
                          {client.first_name} {client.last_name}
                        </h3>
                        <p className="text-gray-400 text-sm">{client.email}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedClients.includes(client.id)
                          ? 'border-gray-400 bg-gray-400'
                          : 'border-gray-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowClientsModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAddClients}
                  className={`${colors.button.primary} px-6 py-2 rounded-lg`}
                >
                  Dodaj wybranych
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Client Modal */}
        {showNewClientModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.modal.container} p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Dodaj nowego klienta</h2>
                <button 
                  onClick={() => setShowNewClientModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className={`${colors.card.stats} p-6 rounded-lg`}>
                  <h3 className="text-lg font-semibold text-white mb-4">Podstawowe informacje</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={colors.form.label}>
                        Imię <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newClient.first_name}
                        onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                        className={colors.form.input}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={colors.form.label}>
                        Nazwisko <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newClient.last_name}
                        onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                        className={colors.form.input}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={colors.form.label}>Email</label>
                      <input
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        className={colors.form.input}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={colors.form.label}>Telefon</label>
                      <input
                        type="tel"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        className={colors.form.input}
                      />
                    </div>
                  </div>
                </div>

                {/* Client Type and Preferences */}
                <div className={`${colors.card.stats} p-6 rounded-lg`}>
                  <h3 className="text-lg font-semibold text-white mb-4">Preferencje klienta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={colors.form.label}>Typ klienta</label>
                      <select
                        value={newClient.type}
                        onChange={(e) => setNewClient({...newClient, type: e.target.value as 'buyer' | 'seller'})}
                        className={colors.form.select}
                      >
                        <option value="buyer">Kupujący</option>
                        <option value="seller">Sprzedający</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={colors.form.label}>Lokalizacje</label>
                      <Select
                        isMulti
                        options={locationOptions}
                        value={locationOptions.filter(option => 
                          newClient.locations.includes(option.value)
                        )}
                        onChange={(selected) => setNewClient({
                          ...newClient,
                          locations: selected.map(option => option.value)
                        })}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary: '#010220',
                            primary25: '#010220',
                            neutral0: '#010220',
                            neutral80: '#ffffff'
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={colors.form.label}>Cena minimalna</label>
                      <input
                        type="number"
                        value={newClient.price_min}
                        onChange={(e) => setNewClient({...newClient, price_min: e.target.value})}
                        className={colors.form.input}
                        placeholder="Minimalna cena"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={colors.form.label}>Cena maksymalna</label>
                      <input
                        type="number"
                        value={newClient.price_max}
                        onChange={(e) => setNewClient({...newClient, price_max: e.target.value})}
                        className={colors.form.input}
                        placeholder="Maksymalna cena"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className={`${colors.card.stats} p-6 rounded-lg`}>
                  <h3 className="text-lg font-semibold text-white mb-4">Notatki</h3>
                  <div className="space-y-2">
                    <textarea
                      value={newClient.notes}
                      onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                      className={`${colors.form.textarea} w-full h-32`}
                      placeholder="Dodatkowe informacje o kliencie..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleCreateClient}
                  disabled={isSubmitting}
                  className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2`}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Utwórz i przypisz
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enlarged Image Modal */}
        {showEnlargedImage && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={() => setShowEnlargedImage(false)}
          >
            <div className="relative max-w-7xl mx-auto px-4">
              <img
                src={selectedOffer.pictures[currentImageIndex]}
                alt={selectedOffer.portalTitle}
                className="max-h-[90vh] w-auto object-contain"
              />
              {selectedOffer.pictures.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </button>
                </>
              )}
              <button
                onClick={() => setShowEnlargedImage(false)}
                className="absolute top-4 right-8 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}
        
        {/* Property Viewing Form */}
        {showViewingForm && selectedOffer && (
          <PropertyViewingForm
            onClose={() => setShowViewingForm(false)}
            onViewingScheduled={() => {
              toast.success('Prezentacja została zaplanowana');
              setShowViewingForm(false);
            }}
            propertyId={selectedOffer.id.toString()}
            propertyAddress={`${selectedOffer.locationCityName}, ${selectedOffer.locationPrecinctName}`}
            propertyTitle={selectedOffer.portalTitle}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Twoje Oferty</h1>
          <div className="flex gap-4">
            <button 
              onClick={fetchOffers}
              className={`${colors.button.secondary} px-4 py-2 rounded-lg flex items-center gap-2`}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Odśwież
            </button>
            <button className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2`}>
              <Plus className="w-5 h-5" />
              Dodaj Ofertę
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj ofert..."
              className={`w-full ${colors.form.search} py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500`}
            />
          </div>
          <button className={`${colors.button.secondary} px-4 py-2 rounded-lg flex items-center gap-2`}>
            <Filter className="w-5 h-5 text-gray-400" />
            Filtry
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading && filteredOffers.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`${colors.text.accent} text-lg font-medium text-center`}
            >
              Przygotowujemy Twoje oferty...
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredOffers.map((offer, index) => (
                <motion.div
                  key={`offer-${offer.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`${colors.card.offer} cursor-pointer`}
                  onClick={() => handleOfferClick(offer)}
                >
                  <div className="relative h-48">
                    <img
                      src={offer.pictures?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80'}
                      alt={offer.portalTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`${colors.button.secondary} text-gray-400 text-xs px-2 py-1 rounded-full`}>
                        {offer.typeName}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-2 line-clamp-2">
                      {offer.portalTitle}
                    </h3>
                    <p className="text-gray-400 font-bold mb-2">
                      {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN'
                      }).format(parseFloat(offer.price))}
                    </p>
                    <div className="text-gray-400 text-sm space-y-1">
                      <p>{offer.locationCityName}, {offer.locationPrecinctName}</p>
                      <p>{offer.areaTotal} m²</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="flex items-center text-sm text-gray-400">
                        <img
                          src="https://cdn.prod.website-files.com/64f34c2162f4f8d189da8e30/65398d6cab58c6a59d34b6da_LZINDBAc16db-RldFsZBL7TlMUlP1WWkFzWjYF8YCAI-p-1080.jpeg"
                          alt={`${offer.contactFirstname} ${offer.contactLastname}`}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span>{offer.contactFirstname} {offer.contactLastname}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredOffers.length === 0 && (
          <div className="text-center text-gray-400 mt-8 p-8 border border-gray-800 rounded-lg">
            Nie znaleziono ofert spełniających kryteria wyszukiwania
          </div>
        )}
      </div>
    </div>
  );
}

export default Offers;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  X, 
  Mail,
  Phone,
  StickyNote,
  Users2,
  Eye,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client } from '../../lib/firebase';
import { clientsService } from '../../lib/clientsService';
import Select from 'react-select';
import { toast } from 'sonner';
import { colors } from '../../config/colors';
import { auth } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const locationOptions = [
  { value: 'mokotow', label: 'Mokotów' },
  { value: 'zoliborz', label: 'Żoliborz' },
  { value: 'ursynow', label: 'Ursynów' },
  { value: 'wola', label: 'Wola' },
  { value: 'srodmiescie', label: 'Śródmieście' }
];

interface ClientsProps {
  type?: 'buyer' | 'seller';
  showDatabase?: boolean;
}

function Clients({ type, showDatabase = false }: ClientsProps) {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
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

  useEffect(() => {
    fetchClients();
    
    // Get current user email for client owner display
    const currentUser = auth.currentUser;
    if (currentUser) {
      setCurrentUserEmail(currentUser.email);
    }
  }, [type]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // If showDatabase is true, get all clients from Firestore regardless of user
      if (showDatabase) {
        // For database view, get all clients regardless of owner
        const clientsCollection = collection(db, 'clients');
        let clientsQuery;
        
        if (type) {
          // If type is specified, filter by type
          clientsQuery = query(
            clientsCollection,
            // No user_id filter here to get all users' clients
            orderBy('created_at', 'desc')
          );
        } else {
          clientsQuery = query(
            clientsCollection,
            orderBy('created_at', 'desc')
          );
        }
        
        const querySnapshot = await getDocs(clientsQuery);
        const allClients: Client[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include clients of specified type or all if no type
          if (!type || data.client_type === type) {
            allClients.push({
              id: doc.id,
              ...data,
              created_at: data.created_at?.toDate?.() 
                ? data.created_at.toDate().toISOString() 
                : new Date().toISOString(),
              updated_at: data.updated_at?.toDate?.() 
                ? data.updated_at.toDate().toISOString() 
                : new Date().toISOString()
            } as Client);
          }
        });
        
        // Sort by date
        allClients.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        setClients(allClients);
      } else {
        // For specific type views (buyers/sellers), just get user's own clients
        const data = await clientsService.getClients(type);
        setClients(data);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.first_name || !newClient.last_name) {
      toast.error('Imię i nazwisko są wymagane');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const clientData = {
        ...newClient,
        price_min: newClient.price_min ? parseFloat(newClient.price_min) : null,
        price_max: newClient.price_max ? parseFloat(newClient.price_max) : null,
        client_type: type || newClient.type
      };

      const createdClient = await clientsService.createClient(clientData);
      setClients(prevClients => [createdClient, ...prevClients]);
      
      setShowAddModal(false);
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
    } catch (err: any) {
      console.error("Error in handleAddClient:", err);
      setError('Failed to add client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterClients = () => {
    let filtered = [...clients];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
      );
    }

    // Filter by locations
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(client =>
        client.locations?.some(loc => selectedLocations.includes(loc))
      );
    }

    // Filter by price range
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(client => {
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return (client.price_min || 0) >= min && (client.price_max || Infinity) <= max;
      });
    }

    return filtered;
  };

  const filteredClients = handleFilterClients();

  const getTitle = () => {
    if (showDatabase) return "Baza Klientów";
    return type === 'buyer' ? "Klienci Kupujący" : "Klienci Sprzedający";
  };

  const getOwnerInfo = (client: Client) => {
    // Return the user email or a generic identifier
    return client.user_id === auth.currentUser?.uid ? 
      (auth.currentUser?.email || "current-user@example.com") : 
      "user-" + client.user_id.substring(0, 6) + "@example.com";
  };

  const isClientOwner = (client: Client) => {
    return client.user_id === auth.currentUser?.uid;
  };

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">{getTitle()}</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className={`${colors.button.addClient} px-6 py-2 rounded-lg transition-colors flex items-center gap-2`}
          >
            <Users2 className="w-5 h-5" />
            Dodaj Klienta
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj klientów..."
              className={`w-full ${colors.form.search} py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500`}
            />
          </div>
          <button 
            onClick={fetchClients}
            className={`${colors.button.secondary} px-4 py-2 rounded-lg flex items-center gap-2`}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Odśwież
          </button>
        </div>

        {showDatabase && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Lokalizacje</label>
              <Select
                isMulti
                options={locationOptions}
                className="react-select-container"
                classNamePrefix="react-select"
                onChange={(selected) => setSelectedLocations(selected.map(option => option.value))}
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
            <div>
              <label className="block text-gray-400 text-sm mb-2">Zakres cenowy</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className={colors.form.input}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className={colors.form.input}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading && filteredClients.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${colors.card.client} p-6 cursor-pointer rounded-xl transition-all duration-200 ${!isClientOwner(client) && showDatabase ? 'border-gray-800' : ''}`}
                onClick={() => navigate(`/platform/clients/${client.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    {client.first_name} {client.last_name}
                    {!isClientOwner(client) && showDatabase && (
                      <span className="ml-2">
                        <Lock className="w-4 h-4 text-yellow-500" />
                      </span>
                    )}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    client.client_type === 'buyer' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {client.client_type === 'buyer' ? 'Kupujący' : 'Sprzedający'}
                  </span>
                </div>
                
                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{client.email || "Brak adresu email"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{client.phone || "Brak numeru telefonu"}</span>
                  </div>
                  <div className="flex items-start gap-2 mt-3">
                    <StickyNote className="w-4 h-4 text-gray-400 mt-1" />
                    <p className="text-sm line-clamp-2">{client.notes || "Brak notatek"}</p>
                  </div>
                </div>
                
                {/* Display client owner info in database view */}
                {showDatabase && (
                  <div className="mt-4 pt-3 border-t border-gray-800">
                    <div className="text-xs text-gray-500">
                      {getOwnerInfo(client)}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filteredClients.length === 0 && (
          <div className="text-center text-gray-400 mt-8 p-8 border border-gray-800 rounded-lg">
            Nie znaleziono klientów spełniających kryteria wyszukiwania
          </div>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.bg.clientCard} border ${colors.border.clientCard} rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
              <h2 className="text-xl font-semibold text-white mb-4 flex justify-between">
                <span>Dodaj nowego klienta</span>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </h2>
              <div className="space-y-4">
                {!type && (
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Typ klienta</label>
                    <select
                      value={newClient.type}
                      onChange={(e) => setNewClient({...newClient, type: e.target.value as 'buyer' | 'seller'})}
                      className={`w-full ${colors.form.search} px-4 py-2 text-white border`}
                    >
                      <option value="buyer">Kupujący</option>
                      <option value="seller">Sprzedający</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Imię <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newClient.first_name}
                    onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                    className={`w-full ${colors.form.search} px-4 py-2 text-white border`}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Nazwisko <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newClient.last_name}
                    onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                    className={`w-full ${colors.form.search} px-4 py-2 text-white border`}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className={`w-full ${colors.form.search} px-4 py-2 text-white border`}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className={`w-full ${colors.form.search} px-4 py-2 text-white border`}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Lokalizacje</label>
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
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Zakres cenowy</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={newClient.price_min}
                      onChange={(e) => setNewClient({...newClient, price_min: e.target.value})}
                      className={`w-full ${colors.form.search} px-4 py-2 text-white border`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={newClient.price_max}
                      onChange={(e) => setNewClient({...newClient, price_max: e.target.value})}
                      className={`w-full ${colors.form.search} px-4 py-2 text-white border`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Notatki</label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    className={`w-full ${colors.form.search} px-4 py-2 text-white h-24 resize-none border`}
                    placeholder="Dodaj notatki o kliencie..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={isSubmitting}
                  className={`${colors.button.addClient} px-6 py-2 rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    'Dodaj'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Clients;
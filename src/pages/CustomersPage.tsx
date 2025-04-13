import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight,
  UserPlus,
  UserMinus,
  Phone,
  Mail,
  MapPin,
  Building,
  Tag,
  MoreHorizontal,
  Users,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { Customer, CustomerStatus, CustomerCategory } from '../models/CustomerTypes';
import { toast } from 'sonner';
import { DocumentSnapshot } from 'firebase/firestore';
import MigrationNotice from '../components/MigrationNotice';

// Status badge component
const StatusBadge = ({ status }: { status: CustomerStatus }) => {
  const statusConfig = {
    active: { color: 'bg-green-500/20 text-green-400' },
    inactive: { color: 'bg-gray-500/20 text-gray-400' },
    lead: { color: 'bg-blue-500/20 text-blue-400' },
    prospect: { color: 'bg-purple-500/20 text-purple-400' },
    archived: { color: 'bg-red-500/20 text-red-400' }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${statusConfig[status].color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Category badge component
const CategoryBadge = ({ category }: { category: CustomerCategory }) => {
  const categoryConfig = {
    individual: { color: 'bg-blue-500/20 text-blue-400', icon: Users },
    business: { color: 'bg-purple-500/20 text-purple-400', icon: Building },
    investor: { color: 'bg-amber-500/20 text-amber-400', icon: ChevronDown },
    developer: { color: 'bg-green-500/20 text-green-400', icon: Building },
    other: { color: 'bg-gray-500/20 text-gray-400', icon: Users }
  };

  const Icon = categoryConfig[category].icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${categoryConfig[category].color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<CustomerCategory | ''>('');
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {} as Record<CustomerStatus, number>,
    byCategory: {} as Record<CustomerCategory, number>
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);
  
  const fetchCustomers = async (isLoadMore = false) => {
    try {
      setIsLoading(true);
      const options: any = { limit: 20 };
      
      if (isLoadMore && lastVisible) {
        options.lastVisible = lastVisible;
      } else if (isLoadMore && !lastVisible) {
        return;
      }
      
      if (statusFilter) {
        options.status = statusFilter;
      }
      
      if (categoryFilter) {
        options.category = categoryFilter;
      }
      
      if (searchTerm) {
        options.search = searchTerm;
      }
      
      const result = await customerService.getCustomers(options);
      
      if (isLoadMore) {
        setCustomers(prev => [...prev, ...result.customers]);
      } else {
        setCustomers(result.customers);
      }
      
      setLastVisible(result.lastVisible);
      setHasMore(result.customers.length === 20);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Błąd podczas pobierania danych');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const result = await customerService.getCustomerStats();
      setStats(result);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const handleSearch = () => {
    fetchCustomers();
  };
  
  const handleFilter = () => {
    fetchCustomers();
  };
  
  const handleLoadMore = () => {
    fetchCustomers(true);
  };
  
  const handleRefresh = () => {
    setLastVisible(null);
    setHasMore(true);
    fetchCustomers();
    fetchStats();
  };
  
  const handleMigrationComplete = () => {
    handleRefresh();
  };
  
  const getAddressString = (customer: Customer) => {
    if (!customer.address) return 'Brak adresu';
    const address = customer.address;
    return `${address.street}, ${address.postal_code} ${address.city}`;
  };

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Baza klientów</h1>
          <div className="flex gap-3">
            <button 
              onClick={handleRefresh}
              className="bg-[#010220] hover:bg-[#010220]/80 text-gray-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Odśwież
            </button>
            <Link 
              to="/customers/new"
              className="bg-[#010220] hover:bg-[#010220]/80 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Dodaj Klienta
            </Link>
          </div>
        </div>
        
        <MigrationNotice onMigrationComplete={handleMigrationComplete} />
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#010220] border border-[#010220] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Wszyscy klienci</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div 
              key={status} 
              className={`bg-[#010220] border border-[#010220] rounded-lg p-4 cursor-pointer ${
                statusFilter === status ? 'border-blue-400' : ''
              }`}
              onClick={() => {
                setStatusFilter(statusFilter === status ? '' : status as CustomerStatus);
                setLastVisible(null);
                setTimeout(handleFilter, 0);
              }}
            >
              <div className="text-sm text-gray-400 mb-1 flex justify-between items-center">
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <StatusBadge status={status as CustomerStatus} />
              </div>
              <div className="text-2xl font-bold text-white">{count}</div>
            </div>
          ))}
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Szukaj klientów..."
              className="w-full bg-[#010220] border border-[#010220] rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
          </div>
          
          <div className="flex gap-3">
            <select 
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as CustomerCategory | '');
                setLastVisible(null);
                setTimeout(handleFilter, 0);
              }}
              className="bg-[#010220] border border-[#010220] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-gray-500"
            >
              <option value="">Wszystkie kategorie</option>
              <option value="individual">Indywidualny</option>
              <option value="business">Biznes</option>
              <option value="investor">Inwestor</option>
              <option value="developer">Deweloper</option>
              <option value="other">Inne</option>
            </select>
            
            <button 
              onClick={handleSearch}
              className="bg-[#010220] border border-[#010220] text-white px-4 py-2 rounded-lg hover:bg-[#010220]/80 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtruj
            </button>
          </div>
        </div>
        
        {/* Customer list */}
        {isLoading && customers.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-[#010220] border border-[#010220] rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-3">Nie znaleziono klientów</div>
            <Link 
              to="/customers/new"
              className="inline-flex items-center text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Dodaj pierwszego klienta
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#010220] border border-[#010220] hover:border-[#E5E5E5]/20 rounded-lg p-5 cursor-pointer transition-all duration-200"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    <StatusBadge status={customer.status} />
                  </div>
                  
                  {customer.company && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                      <Building className="w-4 h-4" />
                      <span>{customer.company.name}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-gray-400 text-sm">
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>{getAddressString(customer)}</span>
                      </div>
                    )}
                  </div>
                  
                  {customer.tags && customer.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {customer.tags.slice(0, 3).map((tag, index) => (
                        <div key={index} className="bg-[#010220]/60 text-gray-400 px-2 py-1 rounded text-xs flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </div>
                      ))}
                      {customer.tags.length > 3 && (
                        <div className="bg-[#010220]/60 text-gray-400 px-2 py-1 rounded text-xs flex items-center">
                          <MoreHorizontal className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-[#E5E5E5]/10 flex justify-between items-center">
                    <CategoryBadge category={customer.category} />
                    <span className="text-xs text-gray-500">
                      {new Date(customer.last_contact_date || customer.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-[#010220] border border-[#010220] hover:bg-[#010220]/80 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <ArrowDown className="w-5 h-5 mr-1" />
                  )}
                  Załaduj więcej
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
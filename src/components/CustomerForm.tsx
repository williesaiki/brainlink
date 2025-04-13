import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Flag, 
  Building, 
  Tag as TagIcon,
  Plus,
  X,
  Languages,
  Briefcase
} from 'lucide-react';
import { Customer, CustomerStatus, CustomerCategory } from '../models/CustomerTypes';
import { customerService } from '../services/customerService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  isEdit?: boolean;
}

export default function CustomerForm({ initialData, isEdit = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(initialData || {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'lead',
    category: 'individual',
    tags: [],
    notes: '',
    preferences: {
      property_preferences: {
        locations: []
      }
    },
    address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'Polska',
      is_primary: true
    }
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [name]: value
      }
    }));
  };
  
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    
    setNewTag('');
  };
  
  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name) {
      toast.error('Imię i nazwisko są wymagane');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEdit && initialData && initialData.id) {
        await customerService.updateCustomer(initialData.id, formData);
        toast.success('Klient zaktualizowany pomyślnie');
        navigate(`/customers/${initialData.id}`);
      } else {
        const newCustomer = await customerService.createCustomer(formData as any);
        toast.success('Klient dodany pomyślnie');
        navigate(`/customers/${newCustomer.id}`);
      }
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast.error('Błąd podczas zapisywania klienta: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-[#010220] border border-[#010220] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Podstawowe informacje</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">
              Imię <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                placeholder="Imię"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">
              Nazwisko <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                placeholder="Nazwisko"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                placeholder="Email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Telefon</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                placeholder="Numer telefonu"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Data urodzenia</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth || ''}
                onChange={handleChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Język</label>
            <div className="relative">
              <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="language"
                value={formData.language || ''}
                onChange={handleChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                placeholder="Preferowany język"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Address */}
      <div className="bg-[#010220] border border-[#010220] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Adres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Ulica</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="street"
                value={formData.address?.street || ''}
                onChange={handleAddressChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                placeholder="Ulica i numer"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Miasto</label>
            <input
              type="text"
              name="city"
              value={formData.address?.city || ''}
              onChange={handleAddressChange}
              className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-4 text-white placeholder-gray-500"
              placeholder="Miasto"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Kod pocztowy</label>
            <input
              type="text"
              name="postal_code"
              value={formData.address?.postal_code || ''}
              onChange={handleAddressChange}
              className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-4 text-white placeholder-gray-500"
              placeholder="Kod pocztowy"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Kraj</label>
            <input
              type="text"
              name="country"
              value={formData.address?.country || 'Polska'}
              onChange={handleAddressChange}
              className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-4 text-white placeholder-gray-500"
              placeholder="Kraj"
            />
          </div>
        </div>
      </div>
      
      {/* Company Information */}
      <div className="bg-[#010220] border border-[#010220] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Informacje o firmie</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Nazwa firmy</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.company?.name || ''}
                onChange={handleCompanyChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                placeholder="Nazwa firmy"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">NIP</label>
            <input
              type="text"
              name="tax_id"
              value={formData.company?.tax_id || ''}
              onChange={handleCompanyChange}
              className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-4 text-white placeholder-gray-500"
              placeholder="NIP"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Strona WWW</label>
            <input
              type="text"
              name="website"
              value={formData.company?.website || ''}
              onChange={handleCompanyChange}
              className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-4 text-white placeholder-gray-500"
              placeholder="https://example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Stanowisko</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="job_title"
                value={formData.job_title || ''}
                onChange={handleChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                placeholder="Stanowisko"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Classification */}
      <div className="bg-[#010220] border border-[#010220] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Klasyfikacja klienta</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Status</label>
            <div className="relative">
              <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                name="status"
                value={formData.status || 'lead'}
                onChange={handleChange}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white appearance-none"
              >
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Kategoria</label>
            <select
              name="category"
              value={formData.category || 'individual'}
              onChange={handleChange}
              className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-4 text-white appearance-none"
            >
              <option value="individual">Indywidualny</option>
              <option value="business">Biznes</option>
              <option value="investor">Inwestor</option>
              <option value="developer">Deweloper</option>
              <option value="other">Inne</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tags and Notes */}
      <div className="bg-[#010220] border border-[#010220] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Tagi i notatki</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Tagi</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(formData.tags || []).map((tag, index) => (
                <div
                  key={index}
                  className="bg-[#E5E5E5]/10 text-gray-300 rounded px-2 py-1 text-sm flex items-center"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="ml-2 text-gray-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                  placeholder="Dodaj tag"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-[#010220] border border-[#E5E5E5]/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#010220]/80 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Dodaj
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-400 text-sm">Notatki</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 h-32 resize-none"
              placeholder="Dodatkowe informacje o kliencie..."
            />
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
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
              {isEdit ? 'Zapisz zmiany' : 'Dodaj klienta'}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
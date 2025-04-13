import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  X, 
  Home,
  Info,
  AlertCircle
} from 'lucide-react';
import { googleCalendarService } from '../../services/googleCalendar';
import { colors } from '../../config/colors';
import { toast } from 'sonner';
import AvailabilityCalendar from './AvailabilityCalendar';

interface PropertyViewingFormProps {
  onClose: () => void;
  onViewingScheduled?: () => void;
  propertyId?: string;
  propertyAddress?: string;
  propertyTitle?: string;
}

export default function PropertyViewingForm({ 
  onClose, 
  onViewingScheduled,
  propertyId,
  propertyAddress = '',
  propertyTitle = ''
}: PropertyViewingFormProps) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(googleCalendarService.isSignedIn);
  const [calendarId, setCalendarId] = useState<string>('primary');

  // Subscribe to auth state changes
  React.useEffect(() => {
    const unsubscribe = googleCalendarService.subscribe(() => {
      setIsGoogleConnected(googleCalendarService.isSignedIn);
    });
    
    return () => unsubscribe();
  }, []);

  const handleTimeSelected = (start: Date, end: Date) => {
    setSelectedTimeSlot({ start, end });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName || !clientEmail || !selectedTimeSlot) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }
    
    if (!isGoogleConnected) {
      toast.error('Połącz swój kalendarz Google, aby zaplanować spotkanie');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create event in Google Calendar
      await googleCalendarService.createPropertyViewing(
        calendarId,
        propertyAddress || 'Adres nieruchomości',
        clientName,
        clientEmail,
        selectedTimeSlot.start,
        selectedTimeSlot.end,
        notes
      );
      
      toast.success('Spotkanie zostało zaplanowane');
      
      if (onViewingScheduled) {
        onViewingScheduled();
      }
      
      onClose();
    } catch (error) {
      console.error('Error scheduling property viewing:', error);
      toast.error('Nie udało się zaplanować spotkania');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${colors.modal.container} w-full max-w-4xl mx-4 rounded-xl p-6 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Zaplanuj prezentację nieruchomości</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property and Client Information */}
          <div className="space-y-6">
            {/* Property Information */}
            <div className={`${colors.card.stats} p-6 rounded-lg`}>
              <h3 className="text-lg font-semibold text-white mb-4">Informacje o nieruchomości</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={colors.form.label}>Tytuł nieruchomości</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={propertyTitle}
                      readOnly
                      className={`${colors.form.input} pl-10`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={colors.form.label}>Adres</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={propertyAddress}
                      readOnly
                      className={`${colors.form.input} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Client Information */}
            <div className={`${colors.card.stats} p-6 rounded-lg`}>
              <h3 className="text-lg font-semibold text-white mb-4">Informacje o kliencie</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={colors.form.label}>
                    Imię i nazwisko <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className={`${colors.form.input} pl-10`}
                      placeholder="Imię i nazwisko klienta"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className={colors.form.label}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className={`${colors.form.input} pl-10`}
                      placeholder="Email klienta"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className={colors.form.label}>Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className={`${colors.form.input} pl-10`}
                      placeholder="Numer telefonu klienta"
                    />
                  </div>
                </div>
                
                <div>
                  <label className={colors.form.label}>Notatki</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`${colors.form.textarea} w-full h-24`}
                    placeholder="Dodatkowe informacje o spotkaniu..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Calendar and Time Selection */}
          <div>
            <AvailabilityCalendar
              onTimeSelected={handleTimeSelected}
              calendarId={calendarId}
              duration={60}
              excludeWeekends={true}
            />
            
            {selectedTimeSlot && (
              <div className="mt-6 bg-blue-500/10 text-blue-400 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Wybrany termin:
                </h4>
                <p>
                  {selectedTimeSlot.start.toLocaleDateString('pl-PL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p>
                  {selectedTimeSlot.start.toLocaleTimeString('pl-PL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {selectedTimeSlot.end.toLocaleTimeString('pl-PL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {!isGoogleConnected && (
          <div className="mt-6 bg-yellow-500/10 text-yellow-400 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>
              Połącz swój kalendarz Google, aby zaplanować spotkanie. Przejdź do ustawień kalendarza, aby połączyć konto.
            </span>
          </div>
        )}
        
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className={`${colors.button.secondary} px-6 py-2 rounded-lg`}
          >
            Anuluj
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedTimeSlot || !isGoogleConnected}
            className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2 ${
              (!selectedTimeSlot || !isGoogleConnected) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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
                Zaplanuj spotkanie
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
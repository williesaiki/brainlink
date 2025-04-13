import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Mail, Phone, MapPin, Save, X, Home, Info, AlertCircle } from 'lucide-react';
import { googleCalendarService } from '../../services/googleCalendar';
import { colors } from '../../config/colors';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import CalendarIntegrationButton from './CalendarIntegrationButton';

interface PropertyViewingSchedulerProps {
  propertyId: string;
  propertyAddress: string;
  propertyTitle: string;
  onScheduled?: () => void;
  onClose?: () => void;
}

export default function PropertyViewingScheduler({
  propertyId,
  propertyAddress,
  propertyTitle,
  onScheduled,
  onClose
}: PropertyViewingSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check Google Calendar connection
  useEffect(() => {
    setIsGoogleConnected(googleCalendarService.isSignedIn);
    
    // Subscribe to auth state changes
    const unsubscribe = googleCalendarService.subscribe(() => {
      setIsGoogleConnected(googleCalendarService.isSignedIn);
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && isGoogleConnected) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, isGoogleConnected]);

  const fetchAvailableSlots = async (date: Date) => {
    setIsLoadingSlots(true);
    setError(null);
    
    try {
      const slots = await googleCalendarService.getAgentAvailability(date);
      setAvailableSlots(slots);
      
      if (slots.length === 0) {
        setError('Brak dostępnych terminów w wybranym dniu');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Nie udało się pobrać dostępnych terminów');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: { start: Date; end: Date }) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName || !clientEmail || !selectedSlot) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }
    
    if (!isGoogleConnected) {
      toast.error('Połącz swój kalendarz Google, aby zaplanować spotkanie');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create event in Google Calendar
      await googleCalendarService.createPropertyViewing(
        'primary',
        propertyAddress,
        clientName,
        clientEmail,
        selectedSlot.start,
        selectedSlot.end,
        notes
      );
      
      toast.success('Spotkanie zostało zaplanowane');
      
      if (onScheduled) {
        onScheduled();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error scheduling property viewing:', error);
      toast.error('Nie udało się zaplanować spotkania');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${colors.card.stats} rounded-xl p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Zaplanuj prezentację nieruchomości</h3>
        {!isGoogleConnected && <CalendarIntegrationButton showSettings={false} />}
      </div>
      
      {!isGoogleConnected ? (
        <div className="bg-yellow-500/10 text-yellow-400 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Połącz swój kalendarz Google, aby zaplanować spotkanie</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Information */}
          <div className="bg-[#010220]/50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Home className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-white font-medium">{propertyTitle}</h4>
                <p className="text-gray-400 text-sm">{propertyAddress}</p>
              </div>
            </div>
          </div>
          
          {/* Date Selection */}
          <div>
            <label className={colors.form.label}>
              Data spotkania <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className={`${colors.form.input} pl-10`}
                required
              />
            </div>
          </div>
          
          {/* Time Slots */}
          {selectedDate && (
            <div>
              <label className={colors.form.label}>
                Godzina spotkania <span className="text-red-500">*</span>
              </label>
              
              {isLoadingSlots ? (
                <div className="flex justify-center items-center h-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                </div>
              ) : error ? (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((slot, index) => {
                    const isSelected = selectedSlot && 
                      selectedSlot.start.getTime() === slot.start.getTime() && 
                      selectedSlot.end.getTime() === slot.end.getTime();
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-2 rounded-lg text-center border ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400' 
                            : 'border-[#E5E5E5]/10 hover:bg-[#010220] text-white'
                        }`}
                      >
                        {format(slot.start, 'HH:mm', { locale: pl })} - {format(slot.end, 'HH:mm', { locale: pl })}
                      </button>
                    );
                  })}
                  
                  {availableSlots.length === 0 && !error && (
                    <div className="col-span-full text-center text-gray-400 py-3">
                      Brak dostępnych terminów w wybranym dniu
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Client Information */}
          <div>
            <label className={colors.form.label}>
              Imię i nazwisko klienta <span className="text-red-500">*</span>
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
              Email klienta <span className="text-red-500">*</span>
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
            <label className={colors.form.label}>Telefon klienta</label>
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
          
          <div className="bg-blue-500/10 text-blue-400 p-4 rounded-lg flex items-start gap-2 text-sm">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Spotkanie zostanie dodane do Twojego kalendarza Google. Klient otrzyma zaproszenie na podany adres email.
            </span>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !selectedSlot}
              className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2 ${
                !selectedSlot ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
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
        </form>
      )}
    </div>
  );
}
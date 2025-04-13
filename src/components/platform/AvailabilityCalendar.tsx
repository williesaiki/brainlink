import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  X, 
  AlertCircle,
  Info
} from 'lucide-react';
import { googleCalendarService } from '../../services/googleCalendar';
import { colors } from '../../config/colors';
import { toast } from 'sonner';
import { format, addDays, isSameDay, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { pl } from 'date-fns/locale';

interface AvailabilityCalendarProps {
  onTimeSelected?: (start: Date, end: Date) => void;
  calendarId?: string;
  duration?: number; // Duration in minutes
  excludeWeekends?: boolean;
}

export default function AvailabilityCalendar({ 
  onTimeSelected, 
  calendarId = 'primary',
  duration = 60,
  excludeWeekends = false
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Initialize and check Google Calendar connection
  useEffect(() => {
    setIsGoogleConnected(googleCalendarService.isSignedIn);
    
    // Subscribe to auth state changes
    const unsubscribe = googleCalendarService.subscribe(() => {
      setIsGoogleConnected(googleCalendarService.isSignedIn);
    });
    
    return () => unsubscribe();
  }, []);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i);
    return day;
  });

  // Fetch availability when selected date changes
  useEffect(() => {
    if (selectedDate && isGoogleConnected) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, calendarId, isGoogleConnected]);

  const fetchAvailability = async (date: Date) => {
    if (!isGoogleConnected) {
      setError('Połącz swój kalendarz Google, aby zobaczyć dostępność');
      setAvailableSlots([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Get agent availability directly from Google Calendar
      let slots: { start: Date; end: Date }[] = [];
      try {
        slots = await googleCalendarService.getAgentAvailability(date, calendarId);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Nie udało się pobrać dostępności z kalendarza Google');
        setAvailableSlots([]);
        setIsLoading(false);
        return;
      }
      
      // Convert slots to duration-specific slots
      const durationSlots = generateTimeSlots(slots, duration);
      setAvailableSlots(durationSlots);
      
      if (durationSlots.length === 0) {
        setError('Brak dostępnych terminów w wybranym dniu');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Nie udało się pobrać dostępności');
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots based on available ranges and desired duration
  const generateTimeSlots = (
    availableRanges: { start: Date; end: Date }[],
    slotDuration: number
  ): { start: Date; end: Date }[] => {
    const slots: { start: Date; end: Date }[] = [];
    
    availableRanges.forEach(range => {
      const { start, end } = range;
      const rangeMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      
      // Skip if range is shorter than desired duration
      if (rangeMinutes < slotDuration) return;
      
      // Generate slots at 30-minute intervals
      const slotInterval = 30; // minutes
      const numSlots = Math.floor((rangeMinutes - slotDuration) / slotInterval) + 1;
      
      for (let i = 0; i < numSlots; i++) {
        const slotStart = new Date(start.getTime() + i * slotInterval * 60 * 1000);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);
        
        // Ensure slot end time doesn't exceed range end time
        if (slotEnd <= end) {
          slots.push({ start: slotStart, end: slotEnd });
        }
      }
    });
    
    return slots;
  };

  const handleDateSelect = (date: Date) => {
    // Skip weekends if excludeWeekends is true
    if (excludeWeekends) {
      const day = date.getDay();
      if (day === 0 || day === 6) {
        toast.error('Weekendy są wyłączone z rezerwacji');
        return;
      }
    }
    
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: { start: Date; end: Date }) => {
    setSelectedSlot(slot);
    
    if (onTimeSelected) {
      onTimeSelected(slot.start, slot.end);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className={`${colors.card.stats} rounded-xl p-6`}>
      <h3 className="text-lg font-semibold text-white mb-6">Wybierz termin spotkania</h3>
      
      {!isGoogleConnected && (
        <div className="mb-6 bg-yellow-500/10 text-yellow-400 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Połącz swój kalendarz Google, aby zobaczyć dostępność</span>
        </div>
      )}
      
      {/* Week navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePreviousWeek}
          className={`${colors.button.secondary} p-2 rounded-lg`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h4 className="text-white font-medium">
          {format(weekDays[0], 'd MMMM', { locale: pl })} - {format(weekDays[6], 'd MMMM yyyy', { locale: pl })}
        </h4>
        
        <button
          onClick={handleNextWeek}
          className={`${colors.button.secondary} p-2 rounded-lg`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Week days */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, index) => {
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const isPast = isDateInPast(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <button
              key={index}
              onClick={() => handleDateSelect(day)}
              disabled={isPast || (excludeWeekends && isWeekend)}
              className={`
                p-3 rounded-lg text-center transition-colors
                ${isSelected ? 'bg-blue-500/20 border border-blue-500/50' : 'border border-[#E5E5E5]/10'}
                ${isPast || (excludeWeekends && isWeekend) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#010220]'}
              `}
            >
              <div className="text-xs text-gray-400 mb-1">
                {format(day, 'EEE', { locale: pl })}
              </div>
              <div className={`text-lg ${isSelected ? 'text-blue-400 font-medium' : 'text-white'}`}>
                {format(day, 'd')}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Time slots */}
      {selectedDate && (
        <div>
          <h4 className="text-white font-medium mb-4">
            Dostępne terminy na {format(selectedDate, 'd MMMM yyyy', { locale: pl })}:
          </h4>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
              />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableSlots.map((slot, index) => {
                const isSlotSelected = selectedSlot && 
                  selectedSlot.start.getTime() === slot.start.getTime() && 
                  selectedSlot.end.getTime() === slot.end.getTime();
                
                return (
                  <button
                    key={index}
                    onClick={() => handleSlotSelect(slot)}
                    className={`
                      p-3 rounded-lg text-center transition-colors flex flex-col items-center
                      ${isSlotSelected ? 'bg-blue-500/20 border border-blue-500/50' : 'border border-[#E5E5E5]/10'}
                      hover:bg-[#010220]
                    `}
                  >
                    <Clock className={`w-4 h-4 mb-1 ${isSlotSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                    <span className={isSlotSelected ? 'text-blue-400' : 'text-white'}>
                      {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                    </span>
                  </button>
                );
              })}
              
              {availableSlots.length === 0 && !error && (
                <div className="col-span-full text-center text-gray-400 py-6">
                  Brak dostępnych terminów w wybranym dniu
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Info */}
      <div className="mt-6 bg-blue-500/10 text-blue-400 p-4 rounded-lg flex items-start gap-2 text-sm">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Dostępność jest synchronizowana z Twoim kalendarzem Google. Spotkania są automatycznie dodawane do kalendarza po potwierdzeniu.
        </span>
      </div>
    </div>
  );
}
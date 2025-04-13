import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { colors } from '../../config/colors';
import { calendarService, CalendarEvent } from '../../services/calendarService';
import { toast } from 'sonner';
import EventForm from './EventForm';
import { format, isSameDay, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';

// Convert CalendarEvent to the format expected by FullScreenCalendar
interface Event {
  id: number;
  name: string;
  time: string;
  datetime: string;
}

interface CalendarData {
  day: Date;
  events: Event[];
}

function ShadcnCalendar() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      // Get current month's date range
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const fetchedEvents = await calendarService.getEvents(startDate, endDate);
      
      // Group events by day
      const eventsByDay: Record<string, CalendarEvent[]> = {};
      
      fetchedEvents.forEach(event => {
        const dateKey = format(event.start, 'yyyy-MM-dd');
        if (!eventsByDay[dateKey]) {
          eventsByDay[dateKey] = [];
        }
        eventsByDay[dateKey].push(event);
      });
      
      // Convert to the format expected by FullScreenCalendar
      const formattedData: CalendarData[] = Object.keys(eventsByDay).map(dateKey => {
        return {
          day: parseISO(dateKey),
          events: eventsByDay[dateKey].map((event, index) => ({
            id: parseInt(event.id) || index + 1,
            name: event.title,
            time: format(event.start, 'h:mm a', { locale: pl }),
            datetime: event.start.toISOString()
          }))
        };
      });
      
      setCalendarData(formattedData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Nie udało się pobrać wydarzeń');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventAdded = (newEvent: CalendarEvent) => {
    // Add the new event to the calendar data
    const dateKey = format(newEvent.start, 'yyyy-MM-dd');
    const existingDayIndex = calendarData.findIndex(data => 
      isSameDay(data.day, newEvent.start)
    );
    
    if (existingDayIndex >= 0) {
      // Add to existing day
      const updatedData = [...calendarData];
      updatedData[existingDayIndex].events.push({
        id: parseInt(newEvent.id) || Math.floor(Math.random() * 1000),
        name: newEvent.title,
        time: format(newEvent.start, 'h:mm a', { locale: pl }),
        datetime: newEvent.start.toISOString()
      });
      setCalendarData(updatedData);
    } else {
      // Create new day entry
      setCalendarData([
        ...calendarData,
        {
          day: newEvent.start,
          events: [{
            id: parseInt(newEvent.id) || Math.floor(Math.random() * 1000),
            name: newEvent.title,
            time: format(newEvent.start, 'h:mm a', { locale: pl }),
            datetime: newEvent.start.toISOString()
          }]
        }
      ]);
    }
    
    setShowEventForm(false);
  };

  if (isLoading && calendarData.length === 0) {
    return (
      <div className="min-h-screen bg-[#000008] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#000008] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Kalendarz</h1>
          <button
            onClick={() => setShowEventForm(true)}
            className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2`}
          >
            <Plus className="w-5 h-5" />
            Dodaj wydarzenie
          </button>
        </div>

        <div className={`${colors.card.stats} rounded-xl overflow-hidden`}>
          <div className="bg-[#010220] text-white">
            <FullScreenCalendar data={calendarData} />
          </div>
        </div>

        {showEventForm && (
          <EventForm 
            onClose={() => setShowEventForm(false)} 
            onEventAdded={handleEventAdded}
          />
        )}

        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.modal.container} max-w-lg w-full mx-4 p-6 rounded-xl`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">{selectedEvent.title}</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedEvent.description && (
                  <div className="bg-[#010220] p-4 rounded-lg">
                    <p className="text-gray-400">{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className={`${colors.button.secondary} px-6 py-2 rounded-lg`}
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShadcnCalendar;
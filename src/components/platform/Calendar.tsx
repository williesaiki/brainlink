import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, X, RefreshCw, LogIn, LogOut, AlertCircle, Settings, Edit, Trash2, Menu } from 'lucide-react';
import { colors } from '../../config/colors';
import { googleCalendarService, GoogleCalendarEvent } from '../../services/googleCalendar';
import { toast } from 'sonner';
import EventForm from './EventForm';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pl'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CalendarIntegrationButton from './CalendarIntegrationButton';
import CalendarSettings from './CalendarSettings';

// Set up the localizer for BigCalendar
moment.locale('pl');
const localizer = momentLocalizer(moment);

// Convert Google Calendar events to BigCalendar events
const convertGoogleEventsToBigCalendarEvents = (events: GoogleCalendarEvent[], timezone: string): CalendarEvent[] => {
  return events.map(event => ({
    id: event.id,
    title: event.summary,
    description: event.description,
    start: new Date(event.start.dateTime),
    end: new Date(event.end.dateTime),
    allDay: event.start.date !== undefined,
    reminders: event.reminders?.overrides?.map(reminder => ({
      method: reminder.method,
      minutes: reminder.minutes
    })) || []
  }));
};

// Define CalendarEvent type for BigCalendar
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  reminders?: {
    method: 'email' | 'popup';
    minutes: number;
  }[];
}

function Calendar() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('day'); // Domyślny widok - dzień
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [calendarId, setCalendarId] = useState<string>('primary');
  const [calendars, setCalendars] = useState<{ id: string; summary: string }[]>([]);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileViewSelectorOpen, setIsMobileViewSelectorOpen] = useState(false);
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const [timezone, setTimezone] = useState<string>(
    localStorage.getItem('calendarTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const viewOptions = [
    { value: 'month', label: 'Miesiąc' },
    { value: 'week', label: 'Tydzień' },
    { value: 'day', label: 'Dzień' }
  ];

  useEffect(() => {
    // Check initial connection status
    setIsGoogleConnected(googleCalendarService.isSignedIn);
    
    // Subscribe to auth state changes
    const unsubscribe = googleCalendarService.subscribe(() => {
      setIsGoogleConnected(googleCalendarService.isSignedIn);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchEvents();
    
    // Fetch available calendars if connected
    if (isGoogleConnected) {
      fetchCalendars();
    }
  }, [currentDate, view, isGoogleConnected, calendarId, timezone]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let startDate = new Date(currentDate);
      let endDate = new Date(currentDate);
      
      if (view === 'month') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else if (view === 'week') {
        const day = currentDate.getDay();
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - day);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
      }
      
      if (isGoogleConnected) {
        try {
          const googleEvents = await googleCalendarService.getEvents(calendarId, startDate, endDate);
          setEvents(convertGoogleEventsToBigCalendarEvents(googleEvents, timezone));
        } catch (err) {
          console.error('Error fetching Google Calendar events:', err);
          setError('Failed to fetch events from Google Calendar. Please try reconnecting your account.');
          setEvents([]);
        }
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events from Google Calendar.');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendars = async () => {
    try {
      const calendarList = await googleCalendarService.getCalendars();
      if (calendarList && calendarList.length > 0) {
        setCalendars(calendarList.map(cal => ({ id: cal.id, summary: cal.summary })));
      } else {
        // Fallback calendars if none are returned
        setCalendars([{ id: 'primary', summary: 'Kalendarz główny' }]);
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
      toast.error('Nie udało się pobrać listy kalendarzy');
      // Set fallback calendars
      setCalendars([{ id: 'primary', summary: 'Kalendarz główny' }]);
    }
  };

  const handleEventAdded = (newEvent: CalendarEvent) => {
    setEvents(prev => [...prev, newEvent]);
    setShowEventForm(false);
    fetchEvents();
  };

  const handleSelectEvent = (event: CalendarEvent) => setSelectedEvent(event);
  const handleEditEvent = () => selectedEvent && setIsEditingEvent(true);

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    try {
      if (!isGoogleConnected) throw new Error('Please connect to Google Calendar first');
      const googleEvent = {
        summary: updatedEvent.title,
        description: updatedEvent.description || '',
        start: { dateTime: updatedEvent.start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: updatedEvent.end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        reminders: { useDefault: false, overrides: updatedEvent.reminders?.map(r => ({ method: r.method, minutes: r.minutes })) || [] }
      };
      await googleCalendarService.updateEvent(calendarId, updatedEvent.id, googleEvent);
      toast.success('Event updated successfully');
      setSelectedEvent(null);
      setIsEditingEvent(false);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      if (!isGoogleConnected) throw new Error('Please connect to Google Calendar first');
      await googleCalendarService.deleteEvent(calendarId, selectedEvent.id);
      toast.success('Event deleted successfully');
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(currentDate);
    if (action === 'PREV') {
      if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
      else newDate.setDate(newDate.getDate() - 1);
    } else if (action === 'NEXT') {
      if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
      else newDate.setDate(newDate.getDate() + 1);
    } else if (action === 'TODAY') newDate.setTime(new Date().getTime());
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setView(newView);
    setIsMobileViewSelectorOpen(false);
  };

  // Button styles for consistent styling
  const buttonPrimary = `${colors.button.primary} px-4 py-2 rounded-lg hover:opacity-90 transition-all`;
  const buttonSecondary = `${colors.button.secondary} px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all`;
  const buttonIcon = `${colors.button.secondary} p-2 rounded-lg hover:bg-opacity-80 transition-all`;

  // Dodajemy CSS dla niestandardowego wyglądu kreski czasu (copied from first code)
  useEffect(() => {
    const addCustomCSS = () => {
      const styleId = 'custom-calendar-styles';
      
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Create new style tag
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .rbc-current-time-indicator {
          background-color: #e74c3c;
          height: 2px;
          position: absolute;
          z-index: 3;
          left: 0;
          right: 0;
        }
        
        .rbc-current-time-indicator::before {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #e74c3c;
          left: -6px;
          top: -5px;
        }
      `;
      
      document.head.appendChild(style);
    };
    
    addCustomCSS();
    
    return () => {
      const styleId = 'custom-calendar-styles';
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div className="p-4 md:p-8 bg-[#000008] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Kalendarz</h1>
          {/* Desktop action buttons */}
          <div className="hidden md:flex gap-3">
            <CalendarIntegrationButton />
            <button
              onClick={() => setShowEventForm(true)}
              className={buttonPrimary}
            >
              <Plus className="w-5 h-5 mr-2 inline" />
              <span>Dodaj wydarzenie</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className={buttonIcon}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Action Buttons - Improved layout */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex-none">
              <CalendarIntegrationButton compact={true} />
            </div>
            <div className="flex-1">
              <button
                onClick={() => setShowEventForm(true)}
                className={buttonPrimary + " w-full flex items-center justify-center shadow-lg"}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="font-medium">Dodaj wydarzenie</span>
              </button>
            </div>
            <div className="flex-none">
              <button
                onClick={() => setShowSettings(true)}
                className={buttonIcon + " shadow"}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className={`${colors.card.stats} rounded-xl p-4 md:p-6 mb-6 border border-gray-800/30 shadow-lg`}>
          {/* Mobile Navigation Controls */}
          <div className="md:hidden mb-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => handleNavigate('PREV')}
                className={buttonIcon}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-medium text-white px-2">
                {view === 'month' && moment(currentDate).format('MMMM YYYY')}
                {view === 'week' && `Tydzień ${moment(currentDate).format('w, YYYY')}`}
                {view === 'day' && moment(currentDate).format('D MMMM YYYY')}
              </h2>
              <button
                onClick={() => handleNavigate('NEXT')}
                className={buttonIcon}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => handleNavigate('TODAY')}
                className={buttonSecondary + " flex-1"}
              >
                Dzisiaj
              </button>
              <button
                onClick={fetchEvents}
                className={buttonIcon}
                disabled={isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Mobile View Selector - Improved dropdown */}
            <div className="relative mb-3">
              <button
                onClick={() => setIsMobileViewSelectorOpen(!isMobileViewSelectorOpen)}
                className={buttonSecondary + " w-full flex items-center justify-between"}
              >
                <span>{viewOptions.find(opt => opt.value === view)?.label}</span>
                <ChevronRight className={`w-4 h-4 transform ${isMobileViewSelectorOpen ? 'rotate-90' : ''} transition-transform`} />
              </button>
              {isMobileViewSelectorOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0c0c20] border border-gray-800/50 rounded-lg overflow-hidden z-20 shadow-xl">
                  {viewOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleViewChange(option.value as 'month' | 'week' | 'day')}
                      className={`w-full text-left px-4 py-3 ${view === option.value ? 'bg-[#101030] text-white font-medium' : 'text-gray-300 hover:bg-[#0a0a18]'} transition-colors`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Panel - Keep original design */}
          <div className="hidden md:block mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
              <div className="flex gap-2 justify-center md:justify-start">
                <button
                  onClick={() => handleNavigate('PREV')}
                  className={buttonIcon}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleNavigate('TODAY')}
                  className={buttonSecondary}
                >
                  Dzisiaj
                </button>
                <button
                  onClick={() => handleNavigate('NEXT')}
                  className={buttonIcon}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white tracking-wide text-center">
                {view === 'month' && moment(currentDate).format('MMMM YYYY')}
                {view === 'week' && `Tydzień ${moment(currentDate).format('w, YYYY')}`}
                {view === 'day' && moment(currentDate).format('D MMMM YYYY')}
              </h2>
              <div className="flex gap-2 justify-center md:justify-end">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewChange('month')}
                    className={view === 'month' ? buttonPrimary : buttonSecondary}
                  >
                    Miesiąc
                  </button>
                  <button
                    onClick={() => handleViewChange('week')}
                    className={view === 'week' ? buttonPrimary : buttonSecondary}
                  >
                    Tydzień
                  </button>
                  <button
                    onClick={() => handleViewChange('day')}
                    className={view === 'day' ? buttonPrimary : buttonSecondary}
                  >
                    Dzień
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop refresh button */}
            <div className="hidden md:flex justify-end mb-4">
              <button
                onClick={fetchEvents}
                className={buttonIcon}
                title="Odśwież"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Calendar Selection - Restored from first code */}
          {isGoogleConnected && calendars.length > 0 && (
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Wybierz kalendarz</label>
              <select
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-2 px-4 text-white"
              >
                {calendars.map((cal) => (
                  <option key={cal.id} value={cal.id}>
                    {cal.summary}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-500/10 text-red-400 p-4 rounded-lg flex items-center gap-2 border border-red-500/20">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Calendar Container - Improved styling */}
          <div className="calendar-container" ref={calendarRef} style={{ height: 'calc(100vh - 240px)', minHeight: '500px' }}>
            {isLoading && events.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-[#010220]/30 rounded-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultTimezone={timezone}
                style={{ 
                  height: '100%', 
                  background: '#010220', 
                  border: '1px solid rgba(28, 37, 67, 0.6)', 
                  borderRadius: '0.5rem', 
                  padding: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                views={{ month: true, week: true, day: true }}
                view={view}
                date={currentDate}
                scrollToTime={new Date(new Date().setHours(new Date().getHours(), 0))}
                timeslots={4}
                step={15}
                onNavigate={(date) => setCurrentDate(date)}
                onView={(newView: any) => {
                  setView(newView);
                  setIsMobileViewSelectorOpen(false);
                }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={() => ({
                  style: {
                    backgroundColor: 'rgba(28, 37, 67, 0.9)', 
                    borderColor: 'rgba(45, 55, 90, 0.8)',
                    color: 'white', 
                    borderRadius: '4px', 
                    padding: '3px 6px', 
                    fontSize: '0.875rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                })}
                dayPropGetter={() => ({ 
                  style: { 
                    backgroundColor: 'rgba(15, 23, 41, 0.5)', 
                    borderColor: 'rgba(28, 37, 67, 0.4)'
                  } 
                })}
                components={{ toolbar: () => null }}
                messages={{
                  next: "Następny", previous: "Poprzedni", today: "Dzisiaj", month: "Miesiąc", week: "Tydzień", day: "Dzień",
                  agenda: "Agenda", date: "Data", time: "Czas", event: "Wydarzenie", allDay: "Cały dzień",
                  noEventsInRange: isGoogleConnected ? "Brak wydarzeń w wybranym okresie" : "Połącz kalendarz Google, aby zobaczyć wydarzenia"
                }}
              />
            )}
          </div>
        </div>

        {/* Event Form Modal */}
        {showEventForm && (
          <EventForm
            onClose={() => setShowEventForm(false)}
            onEventAdded={handleEventAdded}
            calendarId={calendarId}
            isGoogleConnected={isGoogleConnected}
          />
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className={`${colors.modal.container} max-w-lg w-full mx-auto p-6 rounded-xl border border-gray-800/30 shadow-2xl`}>
              {!isEditingEvent ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">{selectedEvent.title}</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditEvent}
                        className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800"
                        title="Edit event"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800"
                        title="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedEvent.description && (
                      <div className="bg-[#010220] p-4 rounded-lg">
                        <p className="text-gray-400">{selectedEvent.description}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <div>{moment(selectedEvent.start).format('DD MMMM YYYY')}</div>
                        <div>{moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}</div>
                      </div>
                    </div>
                    {selectedEvent.reminders?.length > 0 && (
                      <div className="bg-[#010220] p-4 rounded-lg">
                        <h3 className="text-white font-medium mb-2">Przypomnienia</h3>
                        <ul className="space-y-2">
                          {selectedEvent.reminders.map((reminder, index) => (
                            <li key={index} className="text-gray-400">
                              {reminder.method === 'popup' ? 'Powiadomienie' : reminder.method === 'email' ? 'Email' : 'SMS'}: {reminder.minutes} minut przed
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handleDeleteEvent}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Usuń
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className={buttonSecondary}
                      >
                        Zamknij
                      </button>
                      <button
                        onClick={handleEditEvent}
                        className={buttonPrimary + " flex items-center gap-2"}
                      >
                        <Edit className="w-5 h-5" />
                        Edytuj
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <EventForm
                  onClose={() => { setIsEditingEvent(false); setSelectedEvent(null); }}
                  onEventAdded={handleUpdateEvent}
                  initialEvent={selectedEvent}
                  isEditing={true}
                  calendarId={calendarId}
                  isGoogleConnected={isGoogleConnected}
                />
              )}
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && !isEditingEvent && (
          <CalendarSettings
            onClose={() => setShowSettings(false)}
            onSettingsChanged={() => fetchEvents()}
            initialCalendarId={calendarId}
            calendars={calendars}
            onCalendarChange={setCalendarId}
            onTimezoneChange={(newTimezone) => {
              setTimezone(newTimezone);
              localStorage.setItem('calendarTimezone', newTimezone);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Calendar;
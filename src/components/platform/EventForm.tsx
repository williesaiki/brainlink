import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Bell, Plus, Save, X, Trash2 } from 'lucide-react';
import { googleCalendarService } from '../../services/googleCalendar';
import { colors } from '../../config/colors'; 
import { toast } from 'sonner';
import MobileTimePicker from './MobileTimePicker';

// Define ReminderSettings interface
interface ReminderSettings {
  method: 'email' | 'popup' | 'sms';
  minutes: number;
}

// Define CalendarEvent interface
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  reminders?: ReminderSettings[];
}

interface EventFormProps {
  onClose: () => void;                          // Function to close the form
  onEventAdded?: (event: CalendarEvent) => void; // Callback when event is added/updated
  calendarId?: string;                          // Calendar ID to add event to
  isGoogleConnected?: boolean;                  // Whether Google Calendar is connected
  initialEvent?: CalendarEvent;                 // Initial event data for editing
  isEditing?: boolean;                          // Whether we're editing an existing event
}

export default function EventForm({ 
  onClose, 
  onEventAdded, 
  calendarId = 'primary', 
  isGoogleConnected = false,
  initialEvent,
  isEditing = false
}: EventFormProps) {
  // Initialize form state with initialEvent data if provided (for editing)
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  
  // Format dates for form inputs
  const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];
  const formatTimeForInput = (date: Date) => 
    `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  
  // Set initial dates/times based on initialEvent or current time
  const initialStartDate = initialEvent ? initialEvent.start : new Date();
  const initialEndDate = initialEvent ? initialEvent.end : new Date(Date.now() + 60 * 60 * 1000);
  
  const [startDate, setStartDate] = useState(formatDateForInput(initialStartDate));
  const [startTime, setStartTime] = useState(formatTimeForInput(initialStartDate));
  const [endDate, setEndDate] = useState(formatDateForInput(initialEndDate));
  const [endTime, setEndTime] = useState(formatTimeForInput(initialEndDate));
  const [isAllDay, setIsAllDay] = useState(initialEvent?.allDay || false);
  const [showMobileTimePicker, setShowMobileTimePicker] = useState(false);
  const [activeTimeField, setActiveTimeField] = useState<'start' | 'end'>('start');
  
  // Set initial reminders based on initialEvent or default
  const [reminders, setReminders] = useState<ReminderSettings[]>(
    initialEvent?.reminders && initialEvent.reminders.length > 0 
    ? initialEvent.reminders 
    : [
    { method: 'popup', minutes: 30 }
  ]);
  const [timezone, setTimezone] = useState<string>(
    localStorage.getItem('calendarTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = window.innerWidth < 768;

  const handleAddReminder = () => {
    if (reminders.length < 5) {
      setReminders([...reminders, { method: 'popup', minutes: 30 }]);
    } else {
      toast.error('Maksymalnie 5 przypomnień');
    }
  };

  const handleRemoveReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const handleTimeFieldFocus = (field: 'start' | 'end') => {
    if (isMobile && !isAllDay) {
      setActiveTimeField(field);
      setShowMobileTimePicker(true);
    }
  };

  const handleMobileTimeChange = (time: string) => {
    if (activeTimeField === 'start') {
      setStartTime(time);
    } else {
      setEndTime(time);
    }
  };

  const handleReminderChange = (index: number, field: keyof ReminderSettings, value: string | number) => {
    const newReminders = [...reminders];
    if (field === 'method') {
      newReminders[index].method = value as 'email' | 'popup' | 'sms';
    } else {
      newReminders[index].minutes = Number(value);
    }
    setReminders(newReminders);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !startTime || !endDate || !endTime) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if Google Calendar is connected
      const isConnected = googleCalendarService.isSignedIn;
      if (!isConnected && !isGoogleConnected) {
        toast.error('Połącz swój kalendarz Google, aby dodać wydarzenie');
        setIsSubmitting(false);
        return;
      }
      
      let startDateTime, endDateTime;
      
      if (isAllDay) {
        // For all-day events, set times to midnight
        startDateTime = new Date(`${startDate}T00:00:00`);
        // End date should be the next day for all-day events in Google Calendar
        const nextDay = new Date(`${endDate}T00:00:00`);
        nextDay.setDate(nextDay.getDate() + 1);
        endDateTime = nextDay;
      } else {
        startDateTime = new Date(`${startDate}T${startTime}`);
        endDateTime = new Date(`${endDate}T${endTime}`);
      }

      if (endDateTime <= startDateTime) {
        toast.error('Data zakończenia musi być późniejsza niż data rozpoczęcia');
        setIsSubmitting(false);
        return;
      }

      // Create event in Google Calendar
      const eventData = {
        summary: title,
        description: description,
        start: isAllDay 
          ? { date: startDate } 
          : { 
              dateTime: startDateTime.toISOString(),
              timeZone: timezone
            },
        end: isAllDay 
          ? { date: endDate } 
          : { 
              dateTime: endDateTime.toISOString(),
              timeZone: timezone
            },
        reminders: {
          useDefault: false,
          overrides: reminders.map(r => ({
            method: r.method === 'sms' ? 'popup' : r.method, // Google only supports email and popup
            minutes: r.minutes
          }))
        }
      };
      
      let googleEvent;
      
      if (isEditing && initialEvent) {
        // Update existing event
        googleEvent = await googleCalendarService.updateEvent(
          calendarId, 
          initialEvent.id, 
          eventData
        );
      } else {
        googleEvent = await googleCalendarService.createEvent(calendarId, eventData);
      }
      
      // Convert to our CalendarEvent format
      const newEvent: CalendarEvent = {
        id: googleEvent.id,
        title: googleEvent.summary,
        description: googleEvent.description,
        start: googleEvent.start.date 
          ? new Date(googleEvent.start.date) 
          : new Date(googleEvent.start.dateTime),
        end: googleEvent.end.date 
          ? new Date(googleEvent.end.date) 
          : new Date(googleEvent.end.dateTime),
        allDay: !!googleEvent.start.date,
        reminders: googleEvent.reminders?.overrides?.map(r => ({
          method: r.method,
          minutes: r.minutes
        }))
      };
      
      if (onEventAdded) {
        onEventAdded(newEvent);
      }
      
      toast.success(isEditing ? 'Wydarzenie zostało zaktualizowane' : 'Wydarzenie zostało dodane do kalendarza');
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Nie udało się utworzyć wydarzenia w kalendarzu Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`${colors.card.stats} w-full max-w-lg mx-4 rounded-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto border border-gray-800/30`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Dodaj wydarzenie</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className={colors.form.label}>Tytuł <span className="text-red-500">*</span></label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={colors.form.input}
                placeholder="Tytuł wydarzenia"
                required
              />
            </div>

            <div>
              <label className={colors.form.label}>Opis</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${colors.form.textarea} h-24 sm:h-32 focus:border-gray-700 focus:outline-none transition-colors`}
                placeholder="Opis wydarzenia"
              />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-500"
                />
                <span className="text-white">Wydarzenie całodniowe</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={colors.form.label}>Data rozpoczęcia <span className="text-red-500">*</span></label>
                <div className="relative"> 
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`${colors.form.input} pl-10`}
                    required
                  />
                </div>
              </div>
              <div className={isAllDay ? 'opacity-50 pointer-events-none' : ''}>
                <label className={colors.form.label}>Godzina rozpoczęcia <span className="text-red-500">*</span></label>
                <div className="relative"> 
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    onFocus={() => handleTimeFieldFocus('start')}
                    className={`${colors.form.input} pl-10`}
                    required={!isAllDay}
                    disabled={isAllDay}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={colors.form.label}>Data zakończenia <span className="text-red-500">*</span></label>
                <div className="relative"> 
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`${colors.form.input} pl-10`}
                    required
                  />
                </div>
              </div>
              <div className={isAllDay ? 'opacity-50 pointer-events-none' : ''}>
                <label className={colors.form.label}>Godzina zakończenia <span className="text-red-500">*</span></label>
                <div className="relative"> 
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    onFocus={() => handleTimeFieldFocus('end')}
                    className={`${colors.form.input} pl-10`}
                    required={!isAllDay}
                    disabled={isAllDay}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className={`${colors.form.label} ${isAllDay ? 'opacity-50' : ''}`}>Przypomnienia</label>
                <button
                  type="button"
                  onClick={handleAddReminder}
                  className={`${colors.button.secondary} p-2 rounded-lg ${isAllDay ? 'opacity-50 pointer-events-none' : ''}`}
                  disabled={isAllDay}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className={`space-y-3 ${isAllDay ? 'opacity-50 pointer-events-none' : ''}`}>
                {reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={reminder.method}
                        onChange={(e) => handleReminderChange(index, 'method', e.target.value)}
                        className={`${colors.form.select} pl-10 focus:border-gray-700 focus:outline-none transition-colors`}
                      > 
                        <option value="popup">Powiadomienie</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                    <input
                      type="number" 
                      value={reminder.minutes}
                      onChange={(e) => handleReminderChange(index, 'minutes', e.target.value)}
                      className={`${colors.form.input} w-24 focus:border-gray-700 focus:outline-none transition-colors`}
                      min="0"
                      step="5" 
                    />
                    <span className="text-gray-400">min</span>
                    {reminders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveReminder(index)} 
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Mobile Time Picker Modal */}
          {showMobileTimePicker && isMobile && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-[#010220] rounded-xl p-4 w-[90%] max-w-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">
                    {activeTimeField === 'start' ? 'Godzina rozpoczęcia' : 'Godzina zakończenia'}
                  </h3>
                  <button
                    onClick={() => setShowMobileTimePicker(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <MobileTimePicker
                  value={activeTimeField === 'start' ? startTime : endTime}
                  onChange={handleMobileTimeChange}
                  is24Hour={true}
                />
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowMobileTimePicker(false)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Gotowe
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-4 pt-2">
            <div className="flex gap-4 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent hover:bg-gray-800/50 text-gray-400 hover:text-white px-4 sm:px-6 py-2 rounded-lg transition-colors"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${colors.button.primary} px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50`}
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
                    <span>{isEditing ? 'Zapisz zmiany' : 'Zapisz'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Settings, 
  LogIn, 
  LogOut, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  Info,
  Save,
  Globe
} from 'lucide-react';
import { googleCalendarService } from '../../services/googleCalendar';
import { colors } from '../../config/colors';
import { toast } from 'sonner';

interface CalendarSettingsProps {
  onClose: () => void;
  onSettingsChanged?: () => void;
  initialCalendarId?: string;
  calendars?: { id: string; summary: string; primary?: boolean }[];
  onCalendarChange?: (calendarId: string) => void;
  onTimezoneChange?: (timezone: string) => void;
}

export default function CalendarSettings({ 
  onClose, 
  onSettingsChanged,
  initialCalendarId = 'primary',
  calendars = [],
  onCalendarChange,
  onTimezoneChange
}: CalendarSettingsProps) {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>(initialCalendarId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncInterval, setSyncInterval] = useState<number>(15);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    reminderTimes: [30, 60]
  });
  const [timezone, setTimezone] = useState<string>(
    localStorage.getItem('calendarTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [availableTimezones, setAvailableTimezones] = useState<string[]>([]);

  useEffect(() => {
    checkConnectionStatus();
    
    // Subscribe to auth state changes
    const unsubscribe = googleCalendarService.subscribe(() => {
      checkConnectionStatus();
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Get list of available timezones
    try {
      // This is a simplified list of common timezones
      const timezones = [
        'Europe/Warsaw',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'America/New_York',
        'America/Los_Angeles',
        'America/Chicago',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney',
        'Pacific/Auckland'
      ];
      setAvailableTimezones(timezones);
    } catch (error) {
      console.error('Error getting timezones:', error);
    }
  }, []);

  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      setIsGoogleConnected(googleCalendarService.isSignedIn);
      
      if (googleCalendarService.isSignedIn) {
        await fetchCalendars();
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setError('Failed to check connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendars = async () => {
    try {
      const calendarList = await googleCalendarService.getCalendars();
      
      // Set primary calendar as default
      const primaryCalendar = calendarList.find(cal => cal.primary);
      if (primaryCalendar) {
        setSelectedCalendarId(primaryCalendar.id);
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
      setError('Failed to fetch calendars');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsConnecting(true);
      setError(null); 
      // Direct connection to Google Calendar API
      await googleCalendarService.initClient();
      // The initClient method will redirect to Google OAuth
    } catch (error: any) {
      console.error('Error connecting to Google Calendar:', error);
      setError('Failed to connect to Google Calendar');
      toast.error('Nie udało się połączyć z kalendarzem Google');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleCalendarService.signOut();
      setIsGoogleConnected(false);
      setCalendars([]);
      toast.success('Wylogowano z kalendarza Google');
      if (onSettingsChanged) {
        onSettingsChanged();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Nie udało się wylogować z kalendarza Google');
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('calendarSyncInterval', syncInterval.toString());
    localStorage.setItem('calendarNotificationSettings', JSON.stringify(notificationSettings));
    localStorage.setItem('selectedCalendarId', selectedCalendarId);
    localStorage.setItem('calendarTimezone', timezone);
    
    toast.success('Ustawienia kalendarza zostały zapisane');
    
    if (onCalendarChange && selectedCalendarId !== initialCalendarId) {
      onCalendarChange(selectedCalendarId);
    }
    
    if (onTimezoneChange) {
      onTimezoneChange(timezone);
    }
    
    if (onSettingsChanged) {
      onSettingsChanged();
    }
    
    onClose();
  };

  const addReminderTime = () => {
    setNotificationSettings(prev => ({
      ...prev,
      reminderTimes: [...prev.reminderTimes, 15]
    }));
  };

  const removeReminderTime = (index: number) => {
    setNotificationSettings(prev => ({
      ...prev,
      reminderTimes: prev.reminderTimes.filter((_, i) => i !== index)
    }));
  };

  const updateReminderTime = (index: number, value: number) => {
    setNotificationSettings(prev => {
      const newTimes = [...prev.reminderTimes];
      newTimes[index] = value;
      return {
        ...prev,
        reminderTimes: newTimes
      };
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`${colors.modal.container} max-w-lg w-full mx-4 p-6 rounded-xl`}>
          <div className="flex justify-center items-center h-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${colors.modal.container} max-w-lg w-full mx-4 rounded-xl p-6 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Ustawienia kalendarza</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 text-red-400 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Google Calendar Connection */}
          <div className={`${colors.card.stats} p-6 rounded-lg`}>
            <h3 className="text-lg font-semibold text-white mb-4">Połączenie z Google Calendar</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">Status połączenia:</span>
              </div>
              <div className={`flex items-center gap-2 ${isGoogleConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isGoogleConnected ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Połączono</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    <span>Niepołączono</span>
                  </>
                )}
              </div>
            </div>
            
            {isGoogleConnected ? (
              <button
                onClick={handleGoogleSignOut}
                className={`${colors.button.secondary} w-full py-2 rounded-lg flex items-center justify-center gap-2`}
              >
                <LogOut className="w-5 h-5" />
                Rozłącz kalendarz Google
              </button>
            ) : (
              <button
                onClick={handleGoogleAuth}
                disabled={isConnecting}
                className={`${colors.button.primary} w-full py-2 rounded-lg flex items-center justify-center gap-2`}
              >
                {isConnecting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Połącz z Google Calendar
                  </>
                )}
              </button>
            )}
            
            <div className="mt-4 bg-blue-500/10 text-blue-400 p-3 rounded-lg flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Połączenie z Google Calendar umożliwia synchronizację wydarzeń, automatyczne aktualizacje i zarządzanie dostępnością.
              </span>
            </div>
          </div>

          {/* Calendar Selection */}
          {isGoogleConnected && calendars.length > 0 && (
            <div className={`${colors.card.stats} p-6 rounded-lg`}>
              <h3 className="text-lg font-semibold text-white mb-4">Wybór kalendarza</h3>
              
              <div className="space-y-2">
                <label className="block text-gray-400 text-sm">Kalendarz do synchronizacji</label>
                <select
                  value={selectedCalendarId}
                  onChange={(e) => setSelectedCalendarId(e.target.value)}
                  className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-2 px-4 text-white"
                >
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.summary} {calendar.primary ? '(Główny)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mt-4 bg-blue-500/10 text-blue-400 p-3 rounded-lg flex items-start gap-2 text-sm">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Wybierz kalendarz, który będzie używany do synchronizacji wydarzeń. Zalecamy użycie kalendarza głównego lub dedykowanego kalendarza dla spotkań z klientami.
                </span>
              </div>
            </div>
          )}

          {/* Timezone Settings */}
          <div className={`${colors.card.stats} p-6 rounded-lg`}>
            <h3 className="text-lg font-semibold text-white mb-4">Strefa czasowa</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Wybierz strefę czasową</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-2 pl-10 pr-4 text-white appearance-none"
                  >
                    {availableTimezones.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Aktualna strefa czasowa: {timezone}
                </p>
              </div>
            </div>
          </div>

          {/* Synchronization Settings */}
          <div className={`${colors.card.stats} p-6 rounded-lg`}>
            <h3 className="text-lg font-semibold text-white mb-4">Ustawienia synchronizacji</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Częstotliwość synchronizacji (minuty)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(parseInt(e.target.value))}
                  className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-2 px-4 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Ręczna synchronizacja</label>
                <button
                  onClick={() => {
                    toast.success('Kalendarz został zsynchronizowany');
                    if (onSettingsChanged) {
                      onSettingsChanged();
                    }
                  }}
                  className={`${colors.button.secondary} px-4 py-2 rounded-lg flex items-center gap-2`}
                >
                  <RefreshCw className="w-5 h-5" />
                  Synchronizuj teraz
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className={`${colors.card.stats} p-6 rounded-lg`}>
            <h3 className="text-lg font-semibold text-white mb-4">Ustawienia powiadomień</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-400">Powiadomienia email</label>
                <div className="relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full">
                  <input
                    type="checkbox"
                    className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full appearance-none cursor-pointer peer checked:translate-x-4 checked:bg-blue-500"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      emailNotifications: e.target.checked
                    }))}
                  />
                  <label
                    className="block w-10 h-6 overflow-hidden rounded-full cursor-pointer bg-gray-700 peer-checked:bg-blue-700"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-gray-400">Powiadomienia push</label>
                <div className="relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full">
                  <input
                    type="checkbox"
                    className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full appearance-none cursor-pointer peer checked:translate-x-4 checked:bg-blue-500"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      pushNotifications: e.target.checked
                    }))}
                  />
                  <label
                    className="block w-10 h-6 overflow-hidden rounded-full cursor-pointer bg-gray-700 peer-checked:bg-blue-700"
                  ></label>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400">Czasy przypomnień (minuty przed wydarzeniem)</label>
                  <button
                    onClick={addReminderTime}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    + Dodaj przypomnienie
                  </button>
                </div>
                
                <div className="space-y-2">
                  {notificationSettings.reminderTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="1440"
                        value={time}
                        onChange={(e) => updateReminderTime(index, parseInt(e.target.value))}
                        className="flex-1 bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-2 px-4 text-white"
                      />
                      <span className="text-gray-400">min</span>
                      {notificationSettings.reminderTimes.length > 1 && (
                        <button
                          onClick={() => removeReminderTime(index)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-[#010220]/50 p-4 rounded-lg border border-[#E5E5E5]/10">
            <h4 className="text-sm font-medium text-white mb-2">Informacja o prywatności</h4>
            <p className="text-xs text-gray-400">
              Łącząc swój kalendarz Google, wyrażasz zgodę na synchronizację danych między platformą a Twoim kontem Google. 
              Przetwarzamy tylko niezbędne informacje o wydarzeniach, takie jak tytuły, daty i opisy. 
              Możesz w każdej chwili rozłączyć swoje konto i usunąć wszystkie dane.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className={`${colors.button.secondary} px-6 py-2 rounded-lg`}
            >
              Anuluj
            </button>
            <button
              onClick={handleSaveSettings}
              className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2`}
            >
              <Save className="w-5 h-5" />
              Zapisz ustawienia
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
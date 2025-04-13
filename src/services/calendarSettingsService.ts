import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { toast } from 'sonner';

export interface CalendarSettings {
  id?: string;
  user_id?: string;
  default_calendar_id: string;
  timezone: string;
  sync_interval: number;
  notification_settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    reminderTimes: number[];
  };
  created_at?: string;
  updated_at?: string;
}

// Event emitter for settings updates
const settingsUpdateListeners = new Set<() => void>();

export const calendarSettingsService = {
  // Subscribe to settings updates
  subscribe(listener: () => void) {
    settingsUpdateListeners.add(listener);
    return () => settingsUpdateListeners.delete(listener);
  },

  // Notify listeners of settings updates
  notifySettingsUpdate() {
    settingsUpdateListeners.forEach(listener => listener());
  },

  async getSettings(): Promise<CalendarSettings | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      const settingsRef = doc(db, 'calendar_settings', currentUser.uid);
      const settingsSnap = await getDoc(settingsRef);
      
      if (!settingsSnap.exists()) {
        // Return default settings if none exist
        return {
          default_calendar_id: 'primary',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          sync_interval: 15,
          notification_settings: {
            emailNotifications: true,
            pushNotifications: true,
            reminderTimes: [30, 60]
          }
        };
      }
      
      return {
        id: settingsSnap.id,
        ...settingsSnap.data()
      } as CalendarSettings;
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
      // Return default settings on error
      return {
        default_calendar_id: 'primary',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sync_interval: 15,
        notification_settings: {
          emailNotifications: true,
          pushNotifications: true,
          reminderTimes: [30, 60]
        }
      };
    }
  },
  
  async saveSettings(settings: Omit<CalendarSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CalendarSettings> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      const settingsRef = doc(db, 'calendar_settings', currentUser.uid);
      const settingsSnap = await getDoc(settingsRef);
      
      const now = new Date();
      
      if (settingsSnap.exists()) {
        // Update existing settings
        await updateDoc(settingsRef, {
          ...settings,
          updated_at: now
        });
      } else {
        // Create new settings
        await setDoc(settingsRef, {
          ...settings,
          user_id: currentUser.uid,
          created_at: now,
          updated_at: now
        });
      }
      
      // Also save to localStorage for faster access
      localStorage.setItem('calendarTimezone', settings.timezone);
      localStorage.setItem('selectedCalendarId', settings.default_calendar_id);
      localStorage.setItem('calendarSyncInterval', settings.sync_interval.toString());
      localStorage.setItem('calendarNotificationSettings', JSON.stringify(settings.notification_settings));
      
      // Notify listeners
      this.notifySettingsUpdate();
      
      return {
        id: currentUser.uid,
        user_id: currentUser.uid,
        ...settings,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      toast.error('Failed to save calendar settings');
      throw error;
    }
  }
};

export default calendarSettingsService;
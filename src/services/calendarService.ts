import { toast } from 'sonner';

export interface ReminderSettings {
  method: 'email' | 'popup' | 'sms';
  minutes: number;
}

export interface EventDetails {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  reminders: ReminderSettings[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  reminders?: ReminderSettings[];
}

// Local events as fallback
const localEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Spotkanie z klientem',
    description: 'Omówienie oferty mieszkania na Mokotowie',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 10, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 11, 30),
    reminders: [{ method: 'popup', minutes: 30 }]
  },
  {
    id: '2',
    title: 'Prezentacja nieruchomości',
    description: 'Ul. Marszałkowska 15, mieszkanie 45m2',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 14, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 15, 30),
    reminders: [{ method: 'popup', minutes: 60 }]
  },
  {
    id: '3',
    title: 'Szkolenie zespołu',
    description: 'Nowe techniki sprzedaży nieruchomości premium',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 9, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 12, 0),
    reminders: [{ method: 'email', minutes: 120 }]
  },
  {
    id: '4',
    title: 'Spotkanie z deweloperem',
    description: 'Omówienie nowej inwestycji na Wilanowie',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2, 13, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2, 14, 30),
    reminders: [{ method: 'popup', minutes: 45 }]
  },
  {
    id: '5',
    title: 'Podpisanie umowy',
    description: 'Finalizacja transakcji sprzedaży mieszkania',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5, 11, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5, 12, 0),
    reminders: [{ method: 'popup', minutes: 120 }]
  }
];

// Calendar service
export const calendarService = {
  isSignedIn: false,
  tokenClient: null as any,
  gapiInited: false,
  gisInited: false,
  
  // Initialize Google API client
  async initClient(): Promise<boolean> {
    try {
      // Check if we already have an access token
      const savedToken = localStorage.getItem('googleCalendarToken');
      if (savedToken) {
        // Check if token hasn't expired
        const expirationTime = localStorage.getItem('googleCalendarTokenExpires');
        if (expirationTime && new Date().getTime() < parseInt(expirationTime)) {
          this.isSignedIn = true;
          return true;
        } else {
          // Token expired, remove it
          localStorage.removeItem('googleCalendarToken');
          localStorage.removeItem('googleCalendarTokenExpires');
        }
      }
      
      // For now, we'll just use local events and simulate being signed in
      console.log('Using local calendar events instead of Google Calendar API');
      return false;
    } catch (error) {
      console.error('Error initializing client:', error);
      return false;
    }
  },
  
  // Sign in to Google
  async signIn(): Promise<boolean> {
    try {
      // Simulate successful sign-in with local events
      toast.success('Connected to local calendar');
      this.isSignedIn = true;
      return true;
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error('Failed to connect to calendar');
      return false;
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      this.isSignedIn = false;
      localStorage.removeItem('googleCalendarToken');
      localStorage.removeItem('googleCalendarTokenExpires');
      
      toast.success('Logged out from calendar');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  // Create new event
  async createEvent(eventDetails: EventDetails): Promise<CalendarEvent> {
    try {
      // Create a local event
      const newEvent: CalendarEvent = {
        id: Math.random().toString(36).substring(2, 11),
        title: eventDetails.title,
        description: eventDetails.description,
        start: eventDetails.startDate,
        end: eventDetails.endDate,
        reminders: eventDetails.reminders
      };
      
      localEvents.push(newEvent);
      toast.success('Event added to calendar');
      return newEvent;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      
      // Return a default event in case of error
      const defaultEvent: CalendarEvent = {
        id: Math.random().toString(36).substring(2, 11),
        title: eventDetails.title,
        description: eventDetails.description,
        start: eventDetails.startDate,
        end: eventDetails.endDate,
        reminders: eventDetails.reminders
      };
      
      return defaultEvent;
    }
  },

  // Get events
  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      // Return filtered local events
      return localEvents.filter(event => 
        (event.start >= startDate && event.start <= endDate) ||
        (event.end >= startDate && event.end <= endDate) ||
        (event.start <= startDate && event.end >= endDate)
      );
    } catch (error) {
      console.error('Error fetching events:', error);
      
      // Return empty array in case of error
      return [];
    }
  },

  // Handle callback
  async handleCallback(code: string): Promise<boolean> {
    try {
      // Simulate successful callback
      this.isSignedIn = true;
      return true;
    } catch (error) {
      console.error('Error handling callback:', error);
      return false;
    }
  }
};
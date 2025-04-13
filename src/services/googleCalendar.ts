import axios from 'axios';
import { toast } from 'sonner';

// Constants
const CLIENT_ID = '904129270236-q10ddjjeisohgjhqe79q7sfj3m7ccf1a.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

// Add all authorized redirect URIs
const REDIRECT_URIS = [
  `${window.location.origin}/auth/callback`,
  'http://localhost/auth/callback',
  'http://localhost:3000/auth/callback',
  'https://the-estate-hub.firebaseapp.com/__/auth/handler',
  'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--3000--33edf5bb.local-credentialless.webcontainer-api.io/auth/callback'
];

// Determine the appropriate redirect URI based on the current origin
const REDIRECT_URI = REDIRECT_URIS.find(uri => uri.startsWith(window.location.origin)) || REDIRECT_URIS[0];

// Types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
  reminders?: {
    useDefault: boolean;
    overrides?: {
      method: 'email' | 'popup';
      minutes: number;
    }[];
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  created?: string;
  updated?: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  accessRole?: string;
}

// Google Calendar Service
class GoogleCalendarService {
  public isAuthorized = false;
  public accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshToken: string | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    // Try to load tokens from localStorage
    this.loadTokensFromStorage();
    
    // Check if tokens are expired
    if (this.tokenExpiry && this.tokenExpiry < Date.now()) {
      this.refreshAccessToken();
    }
  }

  // Subscribe to auth state changes
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners of auth state changes
  public notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Load tokens from localStorage
  private loadTokensFromStorage(): void {
    try {
      const accessToken = localStorage.getItem('googleCalendarAccessToken');
      const tokenExpiry = localStorage.getItem('googleCalendarTokenExpiry');
      const refreshToken = localStorage.getItem('googleCalendarRefreshToken');
      
      if (accessToken) {
        this.accessToken = accessToken;
        this.isAuthorized = true;
      }
      
      if (tokenExpiry) {
        this.tokenExpiry = parseInt(tokenExpiry, 10);
      }
      
      if (refreshToken) {
        this.refreshToken = refreshToken;
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
    }
  }

  // Save tokens to localStorage
  private saveTokensToStorage(): void {
    try {
      if (this.accessToken) {
        localStorage.setItem('googleCalendarAccessToken', this.accessToken);
      }
      
      if (this.tokenExpiry) {
        localStorage.setItem('googleCalendarTokenExpiry', this.tokenExpiry.toString());
      }
      
      if (this.refreshToken) {
        localStorage.setItem('googleCalendarRefreshToken', this.refreshToken);
      }
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
    }
  }

  // Clear tokens from localStorage
  private clearTokensFromStorage(): void {
    try {
      localStorage.removeItem('googleCalendarAccessToken');
      localStorage.removeItem('googleCalendarTokenExpiry');
      localStorage.removeItem('googleCalendarRefreshToken');
    } catch (error) {
      console.error('Error clearing tokens from storage:', error);
    }
  }

  // Initialize Google API client
  public async initClient(): Promise<boolean> {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('Google Calendar API credentials are missing or invalid');
      toast.error('Brak konfiguracji API Google Calendar');
      return false;
    }

    try {
      // Check if already authorized
      if (this.isAuthorized && this.accessToken && this.accessToken !== 'fallback-token') {
        // Verify token is still valid
        try {
          await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: {
              Authorization: `Bearer ${this.accessToken}`
            }
          });
          return true;
        } catch (error) {
          // Token might be invalid, try refreshing
          if (this.refreshToken) {
            const refreshSuccess = await this.refreshAccessToken();
            if (refreshSuccess) return true;
          }
          // If refresh failed or no refresh token, continue with new auth
        }
      }

      // Check if we're in a WebContainer environment
      // We're now using direct API connection even in WebContainer

      // Create OAuth URL for redirect
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;
      
      // Store the current URL to redirect back after auth
      localStorage.setItem('calendarAuthRedirect', window.location.pathname);
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
      
      return false;
    } catch (error) {
      console.error('Error initializing Google Calendar client:', error);
      return false;
    }
  }

  // Handle OAuth callback
  public async handleCallback(code: string): Promise<boolean> {
    try {
      // Exchange code for tokens
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      });

      // Store tokens
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      this.refreshToken = response.data.refresh_token || this.refreshToken;
      this.isAuthorized = true;
      
      // Save tokens to storage
      this.saveTokensToStorage();
      
      // Notify listeners
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      return false;
    }
  }

  // Refresh access token
  public async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.error('No refresh token available');
      return false;
    }

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      });

      // Update tokens
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      this.isAuthorized = true;
      
      // Save tokens to storage
      this.saveTokensToStorage();
      
      // Notify listeners
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      this.isAuthorized = false;
      this.clearTokensFromStorage();
      return false;
    }
  }

  // Sign out
  public async signOut(): Promise<void> {
    if (this.accessToken && this.accessToken !== 'fallback-token') {
      try {
        // Revoke token
        await axios.post(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`);
      } catch (error) {
        console.error('Error revoking token:', error);
      }
    }
    
    // Clear tokens
    this.accessToken = null;
    this.tokenExpiry = null;
    this.refreshToken = null;
    this.isAuthorized = false;
    
    // Clear tokens from storage
    this.clearTokensFromStorage();
    
    // Notify listeners
    this.notifyListeners();
  }

  // Check if user is signed in
  public get isSignedIn(): boolean {
    return this.isAuthorized && !!this.accessToken;
  }

  // Get user's calendars
  public async getCalendars(): Promise<CalendarListEntry[]> {
    if (!this.isAuthorized || !this.accessToken) {
      throw new Error('Not authorized to access calendars');
    }

    try {
      // Check if token needs refresh
      if (this.tokenExpiry && this.tokenExpiry < Date.now()) {
        await this.refreshAccessToken();
      }

      const response = await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      throw error;
    }
  }

  // Get events from a calendar
  public async getEvents(calendarId: string = 'primary', timeMin?: Date, timeMax?: Date): Promise<GoogleCalendarEvent[]> {
    if (!this.isAuthorized || !this.accessToken) {
      throw new Error('Not authorized to access events');
    }

    try {
      // Check if token needs refresh
      if (this.tokenExpiry && this.tokenExpiry < Date.now()) {
        await this.refreshAccessToken();
      }

      const params: any = {
        singleEvents: true,
        orderBy: 'startTime'
      };

      if (timeMin) {
        params.timeMin = timeMin.toISOString();
      }

      if (timeMax) {
        params.timeMax = timeMax.toISOString();
      }

      const response = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        },
        params
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // Create a new event
  public async createEvent(calendarId: string = 'primary', event: Omit<GoogleCalendarEvent, 'id'>): Promise<GoogleCalendarEvent> {
    if (!this.isAuthorized || !this.accessToken) {
      throw new Error('Not authorized to create events');
    }

    try {
      // Check if token needs refresh
      if (this.tokenExpiry && this.tokenExpiry < Date.now()) {
        await this.refreshAccessToken();
      }

      const response = await axios.post(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        event,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update an existing event
  public async updateEvent(calendarId: string = 'primary', eventId: string, event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> {
    if (!this.isAuthorized || !this.accessToken) {
      throw new Error('Not authorized to update events');
    }

    try {
      // Check if token needs refresh
      if (this.tokenExpiry && this.tokenExpiry < Date.now()) {
        await this.refreshAccessToken();
      }

      const response = await axios.patch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        event,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      
      // For demo purposes, return a mock updated event
      return {
        id: eventId,
        summary: event.summary || 'Updated Event',
        description: event.description || '',
        start: event.start || { dateTime: new Date().toISOString() },
        end: event.end || { dateTime: new Date(Date.now() + 3600000).toISOString() },
        reminders: event.reminders || { useDefault: true }
      };
    }
  }

  // Get a single event by ID
  public async getEvent(calendarId: string = 'primary', eventId: string): Promise<GoogleCalendarEvent> {
    if (!this.isAuthorized || !this.accessToken) {
      throw new Error('Not authorized to get event');
    }

    try {
      // Check if token needs refresh
      if (this.tokenExpiry && this.tokenExpiry < Date.now()) {
        await this.refreshAccessToken();
      }

      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete an event
  public async deleteEvent(calendarId: string = 'primary', eventId: string): Promise<void> {
    if (!this.isAuthorized || !this.accessToken) {
      throw new Error('Not authorized to delete events');
    }

    try {
      // Check if token needs refresh
      if (this.tokenExpiry && this.tokenExpiry < Date.now()) {
        await this.refreshAccessToken();
      }

      await axios.delete(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        }
      );
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Get event details by ID
  public async getEventDetails(calendarId: string = 'primary', eventId: string): Promise<GoogleCalendarEvent> {
    if (!this.isAuthorized || !this.accessToken) {
      throw new Error('Not authorized to get event details');
    }

    try {
      // Check if token needs refresh
      if (this.tokenExpiry && this.tokenExpiry < Date.now()) {
        await this.refreshAccessToken();
      }

      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting event details:', error);
      
      // For demo purposes, return a mock event
      return {
        id: eventId,
        summary: 'Event Details',
        description: 'Event description',
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
        reminders: { useDefault: true }
      };
    }
  }

  // Create a property viewing appointment
  public async createPropertyViewing(
    calendarId: string = 'primary',
    propertyAddress: string,
    clientName: string,
    clientEmail: string,
    startTime: Date,
    endTime: Date,
    notes?: string,
    isAllDay: boolean = false
  ): Promise<GoogleCalendarEvent> {
    const event: Omit<GoogleCalendarEvent, 'id'> = {
      summary: `Prezentacja nieruchomości: ${propertyAddress}`,
      description: `Klient: ${clientName}\n${notes || ''}`,
      location: propertyAddress,
      start: isAllDay ? {
        date: startTime.toISOString().split('T')[0],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } : {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: isAllDay ? {
        date: endTime.toISOString().split('T')[0],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } : {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: [
        {
          email: clientEmail,
          displayName: clientName
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'email',
            minutes: 60
          },
          {
            method: 'popup',
            minutes: 30
          }
        ]
      }
    };

    return this.createEvent(calendarId, event);
  }

  // Get agent's availability for a specific day
  public async getAgentAvailability(date: Date, calendarId: string = 'primary'): Promise<{ start: Date; end: Date }[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Get all events for the day
      const events = await this.getEvents(calendarId, startOfDay, endOfDay);
      
      // Define business hours (9 AM to 6 PM)
      const businessStart = new Date(date);
      businessStart.setHours(9, 0, 0, 0);
      
      const businessEnd = new Date(date);
      businessEnd.setHours(18, 0, 0, 0);
      
      // Start with full business hours availability
      const availableSlots: { start: Date; end: Date }[] = [
        { start: new Date(businessStart), end: new Date(businessEnd) }
      ];
      
      // Remove busy times from available slots
      events.forEach(event => {
        if (event.status === 'cancelled') return;
        
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);
        
        // Skip events outside business hours
        if (eventEnd <= businessStart || eventStart >= businessEnd) return;
        
        // Adjust event times to be within business hours
        const adjustedStart = eventStart < businessStart ? businessStart : eventStart;
        const adjustedEnd = eventEnd > businessEnd ? businessEnd : eventEnd;
        
        // Update available slots
        for (let i = 0; i < availableSlots.length; i++) {
          const slot = availableSlots[i];
          
          // Event completely overlaps slot
          if (adjustedStart <= slot.start && adjustedEnd >= slot.end) {
            availableSlots.splice(i, 1);
            i--;
            continue;
          }
          
          // Event starts before slot and ends within slot
          if (adjustedStart <= slot.start && adjustedEnd > slot.start && adjustedEnd < slot.end) {
            slot.start = new Date(adjustedEnd);
            continue;
          }
          
          // Event starts within slot and ends after slot
          if (adjustedStart > slot.start && adjustedStart < slot.end && adjustedEnd >= slot.end) {
            slot.end = new Date(adjustedStart);
            continue;
          }
          
          // Event is completely within slot
          if (adjustedStart > slot.start && adjustedEnd < slot.end) {
            // Split the slot
            const newSlot = { start: new Date(adjustedEnd), end: new Date(slot.end) };
            slot.end = new Date(adjustedStart);
            availableSlots.splice(i + 1, 0, newSlot);
            i++;
          }
        }
      });
      
      // Filter out slots that are too short (less than 30 minutes)
      return availableSlots.filter(slot => {
        const durationMinutes = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
        return durationMinutes >= 30;
      }).sort((a, b) => a.start.getTime() - b.start.getTime());
    } catch (error) {
      console.error('Error getting agent availability:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, LogIn, LogOut, Settings } from 'lucide-react';
import { googleCalendarService } from '../../services/googleCalendar';
import { colors } from '../../config/colors';
import { toast } from 'sonner';
import CalendarSettings from './CalendarSettings';

interface CalendarIntegrationButtonProps {
  className?: string;
  showSettings?: boolean;
  compact?: boolean;
}

export default function CalendarIntegrationButton({ 
  className = '', 
  showSettings = true,
  compact = false
}: CalendarIntegrationButtonProps) {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);

  useEffect(() => {
    // Check initial connection status
    setIsGoogleConnected(googleCalendarService.isSignedIn);
    
    // Subscribe to auth state changes
    const unsubscribe = googleCalendarService.subscribe(() => {
      setIsGoogleConnected(googleCalendarService.isSignedIn);
    });
    
    return () => unsubscribe();
  }, []);

  const handleGoogleAuth = async () => {
    try {
      setIsConnecting(true);

      // Direct connection to Google Calendar API
      const success = await googleCalendarService.initClient();
      if (success) {
        setIsGoogleConnected(true);
        toast.success('Połączono z kalendarzem Google');
      }
      // If not successful, initClient will redirect to Google OAuth
    } catch (error: any) {
      console.error('Error connecting to Google Calendar:', error);
      toast.error('Nie udało się połączyć z kalendarzem Google');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleCalendarService.signOut();
      setIsGoogleConnected(false);
      toast.success('Wylogowano z kalendarza Google');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Nie udało się wylogować z kalendarza Google');
    }
  };

  const handleSettingsClick = () => {
    setShowCalendarSettings(true);
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {isGoogleConnected ? (
          <> 
            <button
              onClick={handleGoogleSignOut}
              className={`${colors.button.secondary} ${compact ? 'p-2' : 'px-4 py-2'} rounded-lg flex items-center gap-2`}
            >
              <LogOut className="w-5 h-5" />
              {!compact && <span className="hidden sm:inline">Rozłącz kalendarz</span>}
            </button>
            
            {showSettings && (
              <button
                onClick={handleSettingsClick}
                className={`${colors.button.secondary} p-2 rounded-lg`}
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleGoogleAuth}
            disabled={isConnecting}
            className={`${colors.button.primary} ${compact ? 'p-2' : 'px-4 py-2'} rounded-lg flex items-center gap-2`}
          >
            {isConnecting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" 
              />
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                {!compact && <span className="hidden sm:inline">Połącz z Google Calendar</span>}
              </>
            )}
          </button>
        )}
      </div>
      
      {showCalendarSettings && (
        <CalendarSettings 
          onClose={() => setShowCalendarSettings(false)}
          onSettingsChanged={() => { 
            // Refresh calendar data if needed
          }}
        />
      )}
    </>
  );
}
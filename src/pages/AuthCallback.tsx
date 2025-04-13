import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { googleCalendarService } from '../services/googleCalendar';
import { toast } from 'sonner';

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setStatus('error');
          toast.error('No authorization code received');
          return;
        }
        
        const success = await googleCalendarService.handleCallback(code);
        
        if (success) {
          setStatus('success');
          toast.success('Successfully connected to Google Calendar');
          
          // Get the redirect path from localStorage or default to calendar
          const redirectPath = localStorage.getItem('calendarAuthRedirect') || '/platform/calendar';
          localStorage.removeItem('calendarAuthRedirect');
          
          setTimeout(() => {
            navigate(redirectPath);
          }, 2000);
        } else {
          setStatus('error');
          toast.error('Failed to connect to Google Calendar');
          setTimeout(() => {
            navigate('/platform/calendar');
          }, 2000);
        }
      } catch (error) {
        console.error('Error handling callback:', error);
        setStatus('error');
        toast.error('An error occurred during authorization');
        setTimeout(() => {
          navigate('/platform/calendar');
        }, 2000);
      }
    };
    
    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#000008] flex items-center justify-center">
      <div className="bg-[#010220] border border-[#E5E5E5]/10 rounded-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-white border-t-transparent rounded-full mx-auto mb-6"
            />
            <h2 className="text-xl font-semibold text-white mb-2">Przetwarzanie autoryzacji</h2>
            <p className="text-gray-400">Łączenie z Google Calendar...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Połączono pomyślnie</h2>
            <p className="text-gray-400">Za chwilę nastąpi przekierowanie...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Wystąpił błąd</h2>
            <p className="text-gray-400">Nie udało się połączyć z Google Calendar. Za chwilę nastąpi przekierowanie...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
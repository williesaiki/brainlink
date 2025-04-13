import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import { migrateClientsToCustomers } from '../utils/migration';

interface MigrationNoticeProps {
  onMigrationComplete?: () => void;
}

export default function MigrationNotice({ onMigrationComplete }: MigrationNoticeProps) {
  const [isMigrating, setIsMigrating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this notice before
    const dismissed = localStorage.getItem('migrationNoticeDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleMigrate = async () => {
    setIsMigrating(true);
    
    try {
      const success = await migrateClientsToCustomers();
      
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setIsDismissed(true);
          if (onMigrationComplete) {
            onMigrationComplete();
          }
        }, 3000);
      }
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('migrationNoticeDismissed', 'true');
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#010220] border border-[#E5E5E5]/10 rounded-lg p-4 mb-6"
    >
      {showSuccess ? (
        <div className="flex items-center text-green-500">
          <Check className="w-5 h-5 mr-2" />
          <span>Migration completed successfully! Redirecting...</span>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-white font-medium mb-1">Nowy system zarządzania klientami</h3>
              <p className="text-gray-400 text-sm mb-3">
                Wykryliśmy, że masz istniejące dane klientów. Chcesz przenieść je do nowego, 
                rozszerzonego systemu zarządzania klientami z dodatkowymi funkcjami?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleMigrate}
                  disabled={isMigrating}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center"
                >
                  {isMigrating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-1" />
                  )}
                  {isMigrating ? 'Migracja w toku...' : 'Migruj dane'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Przypomnij później
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
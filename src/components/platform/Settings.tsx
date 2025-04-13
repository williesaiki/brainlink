import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Globe, Lock, Save } from 'lucide-react';
import { colors } from '../../config/colors';

function Settings() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Ustawienia</h1>

        <div className="space-y-8">
          {/* Password Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-white">Zmiana hasła</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className={colors.form.label}>Obecne hasło</label>
                <input
                  type="password"
                  placeholder="Obecne hasło"
                  className={colors.form.input}
                />
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Nowe hasło</label>
                <input
                  type="password"
                  placeholder="Nowe hasło"
                  className={colors.form.input}
                />
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Potwierdź nowe hasło</label>
                <input
                  type="password"
                  placeholder="Potwierdź nowe hasło"
                  className={colors.form.input}
                />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-white">Powiadomienia</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox text-gray-400" />
                <span className="text-white">Powiadomienia email</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox text-gray-400" />
                <span className="text-white">Powiadomienia SMS</span>
              </label>
            </div>
          </motion.div>

          {/* Language */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-white">Język</h2>
            </div>
            <div className="space-y-2">
              <label className={colors.form.label}>Wybierz język</label>
              <select className={colors.form.select + " w-full py-3"}>
                <option value="pl">Polski</option>
                <option value="en">English</option>
              </select>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className={`${colors.button.primary} w-full py-3 font-medium ${
              showSuccess ? 'login-success' : ''
            }`}
          >
            <Save className="w-5 h-5 inline-block mr-2" />
            {showSuccess ? 'Zapisano!' : 'Zapisz zmiany'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Lock, Mail } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { colors } from '../config/colors';
import { toast } from 'sonner';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin, user } = useAuthStore();

  // Check if already logged in as admin
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Proszę podać email i hasło');
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await adminLogin(email, password);
      if (success) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from);
      }
    } catch (err) {
      toast.error('Wystąpił błąd podczas logowania');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000008]">
      <div className="w-full max-w-md p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#010220] p-8 rounded-2xl shadow-xl border border-[#E5E5E5]/10"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <Building2 className="w-12 h-12 text-gray-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Panel Administracyjny
            </h2>
            <p className="text-gray-400">
              Zaloguj się do panelu administratora
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#E5E5E5]/20"
                  placeholder="Email administratora"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#E5E5E5]/20"
                  placeholder="Hasło"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-[#010220] hover:bg-[#010220]/80 text-white rounded-lg py-3 font-medium relative overflow-hidden border border-[#E5E5E5]/10 ${
                isLoading ? 'cursor-not-allowed opacity-90' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                />
              ) : (
                'Zaloguj się'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminLogin;
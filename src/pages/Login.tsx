import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Lock, Mail } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { colors } from '../config/colors';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email === 'admin@gmail.com') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/platform', { replace: true });
        }
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#000008] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Proszę podać email i hasło');
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        const from = location.state?.from?.pathname || '/platform';
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="animated-bg">
        <div className="city-skyline"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#0f1729] p-8 rounded-2xl shadow-xl border border-[#E5E5E5]/10"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <Building2 className={`w-12 h-12 ${colors.icon.primary}`} />
            </motion.div>
            <h2 className={`text-2xl font-bold ${colors.text.primary} mb-2`}>
              Witaj ponownie!
            </h2>
            <p className={colors.text.muted}>
              Zaloguj się do swojego konta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.text.muted} w-5 h-5`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  placeholder="Email"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.text.muted} w-5 h-5`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#010220] border border-[#E5E5E5]/10 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  placeholder="Hasło"
                  required
                />
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-[#0f1729] hover:bg-[#010220]/80 text-white rounded-lg py-3 font-medium relative overflow-hidden border border-[#E5E5E5]/10 ${
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

export default Login;
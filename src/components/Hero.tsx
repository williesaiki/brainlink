import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 z-10"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 160 }}
            className="flex justify-center mb-6"
          >
            <Building2 size={64} className="text-accent-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400"
          >
            The Estate Academy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 text-gray-300"
          >
            Twój klucz do sukcesu w nieruchomościach
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-gray-400"
          >
            Platforma dla pośredników, fliperów i deweloperów, która łączy rozwój,
            zarabianie i przynależność do silnego brandu
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <Link to="#pricing" className="btn-primary">
              Dołącz do The Estate Academy
            </Link>
            <Link to="#platform-preview" className="btn-secondary">
              Poznaj szczegóły oferty
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building2, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../config/colors';

export default function Footer() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8 relative">
      <div className="absolute inset-0 z-0 opacity-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </motion.div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-6">
              <Building2 className={`w-8 h-8 ${colors.text.accent} mr-3`} />
              <h3 className="text-xl font-bold text-white">The Estate Academy</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Twój klucz do sukcesu w nieruchomościach. Platforma dla pośredników, 
              fliperów i deweloperów, która łączy rozwój, zarabianie i przynależność 
              do silnego br andu.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Nawigacja</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gray-300 transition-colors">Strona główna</Link>
              </li>
              <li>
                <Link to="#about" className="text-gray-400 hover:text-gray-300 transition-colors">O nas</Link>
              </li>
              <li>
                <Link to="#features" className="text-gray-400 hover:text-gray-300 transition-colors">Oferta</Link>
              </li>
              <li>
                <Link to="#pricing" className="text-gray-400 hover:text-gray-300 transition-colors">Cennik</Link>
              </li>
              <li>
                <Link to="#faq" className="text-gray-400 hover:text-gray-300 transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-gray-300 transition-colors">Logowanie</Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className={`w-5 h-5 ${colors.text.accent} mr-3 mt-1`} />
                <span className="text-gray-400">
                  ul. Marszałkowska 142<br />
                  00-061 Warszawa
                </span>
              </li>
              <li className="flex items-center">
                <Phone className={`w-5 h-5 ${colors.text.accent} mr-3`} />
                <span className="text-gray-400">+48 22 123 45 67</span>
              </li>
              <li className="flex items-center">
                <Mail className={`w-5 h-5 ${colors.text.accent} mr-3`} />
                <span className="text-gray-400">kontakt@estateacademy.pl</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Zapisz się, aby otrzymywać najnowsze informacje i oferty.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Twój adres email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-500"
              />
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg py-2 transition-colors">
                Zapisz się
              </button>
            </form>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} The Estate Academy. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-gray-400"
        viewBox="0 0 696 316"
        fill="none"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.15 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
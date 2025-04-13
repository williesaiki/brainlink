import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GraduationCap, Users, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../config/colors';

export default function PlatformPreview() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="platform-preview" className="py-20 relative">
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
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Nasza platforma</h2>
          <p className={colors.text.muted + " max-w-3xl mx-auto"}>
            Odkryj możliwości, jakie daje The Estate Academy. Nasza platforma to kompleksowe 
            narzędzie dla profesjonalistów z branży nieruchomości.
          </p>
        </motion.div>

        {/* Kursy i szkolenia */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className={`${colors.card.stats} rounded-xl p-8 hover:border-[#E5E5E5]/20 transition-all duration-300`}>
              <GraduationCap className={`w-12 h-12 ${colors.icon.primary} mb-6`} />
              <h3 className="text-2xl font-bold text-white mb-4">Kursy i szkolenia</h3>
              <p className={colors.text.muted + " mb-6"}>
                Dostęp do profesjonalnych kursów i szkoleń prowadzonych przez ekspertów z branży. 
                Od podstaw pośrednictwa po zaawansowane techniki inwestycyjne - wszystko w jednym miejscu.
              </p>
              <ul className="space-y-3 mb-6">
                <li className={`flex items-center ${colors.text.muted}`}>
                  <div className={`w-2 h-2 ${colors.bg.tertiary} rounded-full mr-3`}></div>
                  <span>Kursy wideo dostępne 24/7</span>
                </li>
                <li className={`flex items-center ${colors.text.muted}`}>
                  <div className={`w-2 h-2 ${colors.bg.tertiary} rounded-full mr-3`}></div>
                  <span>Materiały do pobrania i ćwiczenia</span>
                </li>
                <li className={`flex items-center ${colors.text.muted}`}>
                  <div className={`w-2 h-2 ${colors.bg.tertiary} rounded-full mr-3`}></div>
                  <span>Certyfikaty ukończenia</span>
                </li>
              </ul>
              <Link to="/login" className={`inline-flex items-center ${colors.text.accent} hover:text-white transition-colors`}>
                <span>Sprawdź dostępne kursy</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              <div className={`absolute -top-4 -right-4 w-24 h-24 ${colors.bg.tertiary}/10 rounded-lg`}></div>
              <div className={`absolute -bottom-4 -left-4 w-24 h-24 ${colors.bg.tertiary}/10 rounded-lg`}></div>
              <img 
                src="https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&q=80" 
                alt="Platforma kursów The Estate Academy" 
                className="w-full h-auto rounded-lg shadow-xl relative z-10"
              />
            </div>
          </motion.div>
        </div>

        {/* Mentoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className={`absolute -top-4 -left-4 w-24 h-24 ${colors.bg.tertiary}/10 rounded-lg`}></div>
              <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${colors.bg.tertiary}/10 rounded-lg`}></div>
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80" 
                alt="Program mentoringowy The Estate Academy" 
                className="w-full h-auto rounded-lg shadow-xl relative z-10"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className={`${colors.card.stats} rounded-xl p-8 hover:border-[#E5E5E5]/20 transition-all duration-300`}>
              <Users className={`w-12 h-12 ${colors.icon.primary} mb-6`} />
              <h3 className="text-2xl font-bold text-white mb-4">Program mentoringowy</h3>
              <p className={colors.text.muted + " mb-6"}>
                Indywidualne wsparcie od najlepszych ekspertów w branży. Nasi mentorzy to doświadczeni 
                praktycy, którzy pomogą Ci rozwinąć karierę i biznes w nieruchomościach.
              </p>
              <ul className="space-y-3 mb-6">
                <li className={`flex items-center ${colors.text.muted}`}>
                  <div className={`w-2 h-2 ${colors.bg.tertiary} rounded-full mr-3`}></div>
                  <span>Indywidualne sesje mentoringowe</span>
                </li>
                <li className={`flex items-center ${colors.text.muted}`}>
                  <div className={`w-2 h-2 ${colors.bg.tertiary} rounded-full mr-3`}></div>
                  <span>Konsultacje biznesowe</span>
                </li>
                <li className={`flex items-center ${colors.text.muted}`}>
                  <div className={`w-2 h-2 ${colors.bg.tertiary} rounded-full mr-3`}></div>
                  <span>Networking z ekspertami</span>
                </li>
              </ul>
              <Link to="/login" className={`inline-flex items-center ${colors.text.accent} hover:text-white transition-colors`}>
                <span>Poznaj naszych mentorów</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Narzędzia i analizy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className={`${colors.card.stats} rounded-xl p-8 hover:border-[#E5E5E5]/20 transition-all duration-300`}>
              <Target className={`w-12 h-12 ${colors.icon.primary} mb-6`} />
              <h3 className="text-2xl font-bold text-white mb-4">Narzędzia i analizy</h3>
              <p className={colors.text.muted + " mb-6"}>
                Zaawansowane narzędzia do zarządzania ofertami, analizy rynku i śledzenia wyników. 
                Wszystko, czego potrzebujesz, aby prowadzić skuteczny biznes w nieruchomościach.
              </p>
              <ul className="space-y-3 mb-6">
                <li className={`flex items-center ${colors.text.muted}`}>
                  <div className={`w-2 h-2 ${colors.bg.tertiary} rounded-full mr-3`}></div>
                  <span>Zarządzanie ofertami</span>
                </li>
                <li className={`flex items-center ${colors.text.muted}`}>
                  <div className={`w-2 h-2 ${colors.bg.tertiary} rounded-full mr-3`}></div>
                  <span>Analizy i raporty</span>
                </li>
                <li className={`flex items-center ${colors.text.muted}`}>
                  <div className={`w-2 h-2 ${colors.bg.tertiary} rounded-full mr-3`}></div>
                  <span>Kalkulatory inwestycyjne</span>
                </li>
              </ul>
              <Link to="/login" className={`inline-flex items-center ${colors.text.accent} hover:text-white transition-colors`}>
                <span>Odkryj nasze narzędzia</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              <div className={`absolute -top-4 -right-4 w-24 h-24 ${colors.bg.tertiary}/10 rounded-lg`}></div>
              <div className={`absolute -bottom-4 -left-4 w-24 h-24 ${colors.bg.tertiary}/10 rounded-lg`}></div>
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" 
                alt="Narzędzia analityczne The Estate Academy" 
                className="w-full h-auto rounded-lg shadow-xl relative z-10"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link to="/login" className={`${colors.button.primary} inline-flex items-center`}>
            <span>Dołącz do The Estate Academy</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
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
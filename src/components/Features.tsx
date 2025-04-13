import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building, Users, BookOpen, PiggyBank, Lightbulb } from 'lucide-react';
import { colors } from '../config/colors';

const features = [
  {
    icon: Building,
    title: 'Silny Brand',
    description: 'Przynależność do rozpoznawalnej marki bez konieczności jej budowania od podstaw'
  },
  {
    icon: Users,
    title: 'Społeczność',
    description: 'Dołącz do elitarnej społeczności profesjonalistów z branży nieruchomości'
  },
  {
    icon: BookOpen,
    title: 'Rozwój',
    description: 'Dostęp do szkoleń, webinarów i mentoringu od najlepszych ekspertów'
  },
  {
    icon: PiggyBank,
    title: 'Finansowanie',
    description: 'Wsparcie w pozyskiwaniu finansowania na projekty deweloperskie i flipy'
  },
  {
    icon: Lightbulb,
    title: 'Innowacje',
    description: 'Nowoczesne narzędzia i rozwiązania wspierające Twoją działalność'
  }
];

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="features" className="py-20 relative">
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
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
          className="section-title"
        >
          Dlaczego The Estate Academy?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
          {features.slice(0, 3).map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`${colors.card.feature} hover:border-[#E5E5E5]/20 transition-all duration-300`}
            >
              <feature.icon className={`w-12 h-12 ${colors.icon.primary} mb-4`} />
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className={colors.text.muted}>{feature.description}</p>
            </motion.div>
          ))}

          {/* Specjalny kontener dla dwóch ostatnich kafelków - wycentrowany */}
          <div className="lg:col-span-3 flex flex-col md:flex-row justify-center gap-8 mx-auto">
            {features.slice(3).map((feature, index) => (
              <motion.div
                key={index + 3}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: (index + 3) * 0.2 }}
                className={`${colors.card.feature} md:max-w-xs hover:border-[#E5E5E5]/20 transition-all duration-300`}
              >
                <feature.icon className={`w-12 h-12 ${colors.icon.primary} mb-4`} />
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className={colors.text.muted}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
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
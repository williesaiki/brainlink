import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building2, Award, Users, Target, MapPin } from 'lucide-react';
import { colors } from '../config/colors';

export default function AboutUs() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const stats = [
    { value: '10+', label: 'Lat doświadczenia', icon: Award },
    { value: '500+', label: 'Zadowolonych klientów', icon: Users },
    { value: '1000+', label: 'Transakcji', icon: Target },
    { value: '5', label: 'Lokalizacji w Polsce', icon: MapPin }
  ];

  return (
    <section id="about" className="py-20 relative">
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
          <h2 className="section-title">O nas</h2>
          <p className={colors.text.muted + " max-w-3xl mx-auto"}>
            The Estate Academy to innowacyjna platforma dla profesjonalistów z branży nieruchomości, 
            która wywodzi się z doświadczeń renomowanej agencji The Estate Warsaw.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className={`absolute -top-4 -left-4 w-24 h-24 ${colors.bg.tertiary}/10 rounded-lg`}></div>
              <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${colors.bg.tertiary}/10 rounded-lg`}></div>
              <img 
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80" 
                alt="Nowoczesne biuro The Estate Academy" 
                className="w-full h-auto rounded-lg shadow-xl relative z-10"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Nasza historia</h3>
            <p className={colors.text.muted + " mb-6"}>
              The Estate Academy powstała z pasji do nieruchomości i potrzeby stworzenia kompleksowego 
              rozwiązania dla osób działających w tej branży. Wywodząc się z doświadczeń renomowanej 
              agencji <a href="https://theestate.pl" target="_blank" rel="noopener noreferrer" className={colors.text.accent + " hover:underline"}>The Estate Warsaw</a>, łączymy wieloletnie doświadczenie z innowacyjnym 
              podejściem do edukacji i rozwoju w branży nieruchomości.
            </p>
            <p className={colors.text.muted + " mb-6"}>
              Nasz zespół składa się z doświadczonych ekspertów, którzy przez lata zdobywali doświadczenie 
              w różnych segmentach rynku. Z agencji nieruchomości rozwinęliśmy się w platformę 
              edukacyjno-networkingową, która wspiera pośredników, inwestorów i deweloperów w całej Polsce.
            </p>
            <div className="flex items-center">
              <Building2 className={`w-12 h-12 ${colors.icon.primary} mr-4`} />
              <div>
                <h4 className="text-white font-semibold">The Estate Academy</h4>
                <p className={colors.text.accent}>Twój klucz do sukcesu w nieruchomościach</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${colors.card.stats} rounded-xl p-6 text-center`}
            >
              <div className="flex justify-center mb-4">
                <stat.icon className={`w-10 h-10 ${colors.icon.primary}`} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <p className={colors.text.muted}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Nasza misja</h3>
          <p className={colors.text.muted + " max-w-3xl mx-auto mb-8"}>
            Naszą misją jest dostarczanie najwyższej jakości narzędzi, wiedzy i wsparcia, które 
            pozwolą naszym członkom osiągać ponadprzeciętne wyniki w branży nieruchomości. 
            Wierzymy, że sukces w tej dziedzinie opiera się na ciągłym rozwoju, budowaniu 
            relacji i dostępie do sprawdzonych rozwiązań.
          </p>
          <button className={colors.button.primary}>
            Poznaj nasz zespół
          </button>
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
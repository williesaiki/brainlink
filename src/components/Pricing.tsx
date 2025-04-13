import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check } from 'lucide-react';
import { colors } from '../config/colors';

const plans = [
  {
    name: 'Basic',
    price: '499',
    features: [
      'Dostęp do platformy szkoleniowej',
      'Podstawowe narzędzia',
      'Wsparcie społeczności',
      'Newsletter branżowy'
    ]
  },
  {
    name: 'Professional',
    price: '1999',
    popular: true,
    features: [
      'Wszystko z Basic',
      'Mentoring indywidualny',
      'Dostęp do finansowania',
      'Priorytetowe wsparcie',
      'System poleceń'
    ]
  },
  {
    name: 'Premium',
    price: '4999',
    features: [
      'Wszystko z Professional',
      'Dedykowany opiekun',
      'Ekskluzywne szkolenia',
      'Priorytetowe finansowanie',
      'Udział w mastermind group'
    ]
  }
];

export default function Pricing() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="pricing" className="py-20 relative">
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
          <h2 className="section-title">Wybierz swój plan</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Dopasuj pakiet do swoich potrzeb i rozpocznij współpracę z The Estate Academy
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`feature-card relative ${
                plan.popular ? 'border-gray-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gray-600 text-white px-4 py-1 rounded-full text-sm">
                    Popularny wybór
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400"> PLN/msc</span>
              </div>
              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className={`w-5 h-5 ${colors.text.accent} mr-2`} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full mt-8 ${
                plan.popular ? 'btn-primary' : 'btn-secondary'
              }`}>
                Wybierz plan
              </button>
            </motion.div>
          ))}
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
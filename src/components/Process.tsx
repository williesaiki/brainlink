import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ClipboardCheck, PhoneCall, Handshake, Rocket } from 'lucide-react';
import { useEffect } from 'react';
import { colors } from '../config/colors';

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Wypełnij formularz',
    description: 'Zostaw nam swoje dane kontaktowe'
  },
  {
    icon: PhoneCall,
    title: 'Kontakt',
    description: 'Skontaktujemy się i ustalimy szczegóły'
  },
  {
    icon: Handshake,
    title: 'Decyzja',
    description: 'Wspólnie podejmiemy decyzję o współpracy'
  },
  {
    icon: Rocket,
    title: 'Start',
    description: 'Rozpocznij działanie z The Estate Academy'
  }
];

export default function Process() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <section id="process" className="py-20 relative">
      <div className="absolute inset-0 z-0 opacity-10">
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
          Jak to działa?
        </motion.h2>

        <div className="relative mt-20">
          <div className={`absolute top-1/2 left-0 w-full h-1 ${colors.bg.tertiary} transform -translate-y-1/2 hidden md:block`} />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      delay: index * 0.2
                    }
                  }
                }}
                className="relative text-center group"
                whileHover={{ scale: 1.05 }}
              >
                <div className={`process-step group-hover:active`}>
                  <div className={`icon-wrapper ${colors.effects.active}`}>
                    <step.icon className={`w-8 h-8 ${colors.icon.primary}`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                <p className={colors.text.muted}>{step.description}</p>
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
        className={`w-full h-full ${colors.text.accent}`}
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
            initial={{ pathLength: 0.3, opacity: 0.8 }}
            animate={{
              pathLength: 1,
              opacity: [0.4, 0.8, 0.4],
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
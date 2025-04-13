import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Slider from 'react-slick';
import { Star } from 'lucide-react';
import { colors } from '../config/colors';

const testimonials = [
  {
    name: "Marcin K.",
    text: "The Estate Academy otworzyło przede mną nowe możliwości w branży nieruchomości. Wsparcie mentorów jest nieocenione!",
    rating: 5
  },
  {
    name: "Anna W.",
    text: "Dzięki platformie znacząco zwiększyłam swoje obroty. Dostęp do finansowania i szkoleń to strzał w dziesiątkę.",
    rating: 5
  },
  {
    name: "Piotr M.",
    text: "Profesjonalne podejście i świetne narzędzia. Polecam każdemu, kto chce rozwinąć się w branży nieruchomości.",
    rating: 5
  },
  {
    name: "Karolina B.",
    text: "Najlepsza decyzja biznesowa, jaką podjęłam. System poleceń działa rewelacyjnie!",
    rating: 5
  },
  {
    name: "Tomasz L.",
    text: "Świetna społeczność i wsparcie na każdym kroku. Warto zainwestować w swój rozwój z The Estate Academy.",
    rating: 5
  },
  {
    name: "Magdalena R.",
    text: "Kompleksowe podejście do rozwoju w branży. Jestem pod wrażeniem jakości szkoleń i mentoringu.",
    rating: 5
  },
  {
    name: "Robert P.",
    text: "Dzięki platformie udało mi się sfinansować pierwszy flip. Teraz działam już przy trzecim projekcie!",
    rating: 5
  },
  {
    name: "Agnieszka D.",
    text: "Świetne materiały szkoleniowe i stały kontakt z ekspertami. Polecam każdemu początkującemu inwestorowi.",
    rating: 5
  },
  {
    name: "Michał S.",
    text: "Profesjonalizm na najwyższym poziomie. The Estate Academy to must-have dla każdego w branży!",
    rating: 5
  },
  {
    name: "Joanna T.",
    text: "Rewelacyjne wsparcie i dostęp do wiedzy ekspertów. Najlepsza inwestycja w rozwój zawodowy.",
    rating: 5
  }
];

export default function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const settings = {
    dots: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <section className="py-20 overflow-hidden relative">
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
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-title mb-12"
        >
          Co mówią nasi klienci?
        </motion.h2>

        <div className="testimonial-carousel">
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="px-2 h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="feature-card h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${colors.text.accent} fill-current`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4">{testimonial.text}</p>
                  </div>
                  <p className={colors.text.accent}>{testimonial.name}</p>
                </motion.div>
              </div>
            ))}
          </Slider>
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
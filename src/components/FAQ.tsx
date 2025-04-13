import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { colors } from '../config/colors';

const faqs = [
  {
    question: 'Czym jest The Estate Academy?',
    answer: 'The Estate Academy to kompleksowa platforma dla profesjonalistów z branży nieruchomości, która łączy edukację, networking i praktyczne narzędzia do rozwoju kariery. Oferujemy szkolenia, mentoring, dostęp do finansowania i silną społeczność ekspertów.'
  },
  {
    question: 'Dla kogo przeznaczona jest platforma?',
    answer: 'Nasza platforma jest dedykowana pośrednikom nieruchomości, inwestorom, flipperom oraz deweloperom, którzy chcą rozwijać swoją karierę i biznes w branży nieruchomości. Zarówno osoby początkujące, jak i doświadczeni profesjonaliści znajdą u nas wartościowe zasoby.'
  },
  {
    question: 'Jak działa system finansowania projektów?',
    answer: 'Członkowie The Estate Academy mają dostęp do preferencyjnych warunków finansowania projektów inwestycyjnych i deweloperskich. Współpracujemy z zaufanymi partnerami finansowymi, którzy oferują specjalne warunki dla naszych członków. Każdy projekt jest analizowany indywidualnie.'
  },
  {
    question: 'Czy mogę korzystać z platformy zdalnie?',
    answer: 'Tak, platforma The Estate Academy jest w pełni dostępna online. Wszystkie szkolenia, webinary i konsultacje z mentorami mogą odbywać się zdalnie. Organizujemy również cykliczne spotkania stacjonarne dla członków, ale udział w nich nie jest obowiązkowy.'
  },
  {
    question: 'Jak wygląda proces dołączenia do The Estate Academy?',
    answer: 'Proces dołączenia jest prosty. Wybierz odpowiedni dla siebie plan, wypełn ij formularz zgłoszeniowy, a nasz zespół skontaktuje się z Tobą w ciągu 24 godzin. Przeprowadzimy krótką rozmowę kwalifikacyjną, aby lepiej poznać Twoje potrzeby i cele, a następnie pomożemy Ci rozpocząć korzystanie z platformy.'
  },
  {
    question: 'Czy mogę zmienić lub anulować subskrypcję?',
    answer: 'Tak, możesz zmienić swój plan lub anulować subskrypcję w dowolnym momencie. Wystarczy skontaktować się z naszym działem obsługi klienta. W przypadku anulowania, zachowasz dostęp do platformy do końca opłaconego okresu.'
  },
  {
    question: 'Jakie materiały edukacyjne oferujecie?',
    answer: 'Oferujemy szeroki zakres materiałów edukacyjnych, w tym kursy wideo, webinary, e-booki, szablony dokumentów, kalkulatory inwestycyjne oraz studia przypadków. Wszystkie materiały są regularnie aktualizowane, aby odzwierciedlać aktualne trendy i przepisy w branży nieruchomości.'
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 relative">
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
          <h2 className="section-title">Często zadawane pytania</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące The Estate Academy
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="mb-4"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full text-left p-6 rounded-lg transition-colors flex justify-between items-center ${
                  activeIndex === index 
                    ? 'bg-gray-800 border-l-4 border-gray-500' 
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                {activeIndex === index ? (
                  <ChevronUp className={`w-5 h-5 ${colors.text.accent}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${colors.text.accent}`} />
                )}
              </button>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: activeIndex === index ? 'auto' : 0,
                  opacity: activeIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden bg-gray-900/50 rounded-b-lg"
              >
                <div className="p-6 text-gray-400">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-6">Nie znalazłeś odpowiedzi na swoje pytanie?</p>
          <button className="btn-secondary">
            Skontaktuj się z nami
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
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send } from 'lucide-react';
import { colors } from '../../config/colors';

const faqs = [
  {
    question: 'Jak dołączyć do The Estate Academy?',
    answer: 'Aby dołączyć do The Estate Academy, wybierz odpowiedni plan na stronie głównej i wypełnij formularz rejestracyjny. Nasz zespół skontaktuje się z Tobą w ciągu 24 godzin.'
  },
  {
    question: 'Jak działa finansowanie?',
    answer: 'Oferujemy różne opcje finansowania dla naszych członków, w tym kredyty hipoteczne i pożyczki inwestycyjne. Każdy przypadek rozpatrujemy indywidualnie, dopasowując rozwiązanie do Twoich potrzeb.'
  },
  {
    question: 'Jakie są korzyści z członkostwa Premium?',
    answer: 'Członkostwo Premium daje dostęp do ekskluzywnych szkoleń, indywidualnego mentoringu, priorytetowego wsparcia oraz zaawansowanych narzędzi do zarządzania nieruchomościami.'
  },
  {
    question: 'Jak mogę zmienić swój plan?',
    answer: 'Możesz zmienić swój plan w każdej chwili w sekcji "Ustawienia konta". Zmiana zostanie wprowadzona od następnego okresu rozliczeniowego.'
  },
  {
    question: 'Czy mogę anulować członkostwo?',
    answer: 'Tak, możesz anulować członkostwo w dowolnym momencie. Skontaktuj się z naszym zespołem wsparcia, aby uzyskać pomoc w procesie anulowania.'
  }
];

function Help() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => {
      setFormStatus('sent');
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Centrum Pomocy</h1>

        {/* FAQs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Często zadawane pytania</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${colors.card.stats} rounded-xl overflow-hidden`}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <span className="text-white font-medium">{faq.question}</span>
                  <HelpCircle
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      activeIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: activeIndex === index ? 'auto' : 0 }}
                  className="overflow-hidden"
                >
                  <div className={`px-6 pb-4 ${colors.text.muted}`}>{faq.answer}</div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className={`${colors.card.stats} rounded-xl p-6`}>
          <h2 className="text-xl font-semibold text-white mb-6">Skontaktuj się z nami</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className={colors.form.label}>Imię i nazwisko</label>
              <input
                type="text"
                placeholder="Imię i nazwisko"
                className={colors.form.input}
              />
            </div>
            <div className="space-y-2">
              <label className={colors.form.label}>Email</label>
              <input
                type="email"
                placeholder="Email"
                className={colors.form.input}
              />
            </div>
            <div className="space-y-2">
              <label className={colors.form.label}>Twoja wiadomość</label>
              <textarea
                placeholder="Twoja wiadomość"
                rows={4}
                className={`${colors.form.textarea} w-full px-4 py-3`}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${colors.button.primary} w-full py-3 font-medium ${
                formStatus === 'sent' ? 'login-success' : ''
              }`}
              disabled={formStatus !== 'idle'}
            >
              {formStatus === 'sending' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : formStatus === 'sent' ? (
                'Wysłano!'
              ) : (
                <>
                  <Send className="w-5 h-5 inline-block mr-2" />
                  Wyślij wiadomość
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Help;
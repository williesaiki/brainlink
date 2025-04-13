import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Lock, Star, Clock, BookOpen, Download, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { colors } from '../../config/colors';

const courses = [
  {
    id: 1,
    title: "Podstawy Pośrednictwa Nieruchomości",
    description: "Kompletny kurs wprowadzający do zawodu pośrednika nieruchomości. Poznaj prawne, marketingowe i praktyczne aspekty pracy w branży.",
    image: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?auto=format&fit=crop&q=80",
    duration: "8 godzin",
    lessons: 24,
    rating: 4.8,
    reviews: 156,
    instructor: "Anna Kowalska",
    unlocked: true
  },
  {
    id: 2,
    title: "Zaawansowane Techniki Sprzedaży Nieruchomości Premium",
    description: "Specjalistyczny kurs dla pośredników chcących specjalizować się w segmencie nieruchomości luksusowych. Poznaj psychologię klienta premium i techniki prezentacji.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80",
    duration: "12 godzin",
    lessons: 36,
    rating: 4.9,
    reviews: 89,
    instructor: "Marek Nowak",
    unlocked: false,
    price: "1499 PLN"
  },
  {
    id: 3,
    title: "Inwestowanie w Nieruchomości na Wynajem",
    description: "Kompleksowy przewodnik po inwestowaniu w nieruchomości pod wynajem krótko- i długoterminowy. Od analizy rynku po zarządzanie najmem.",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80",
    duration: "10 godzin",
    lessons: 28,
    rating: 4.7,
    reviews: 112,
    instructor: "Katarzyna Wiśniewska",
    unlocked: false,
    price: "1299 PLN"
  }
];

function Courses() {
  const navigate = useNavigate();
  const { courseProgress } = useAuthStore();

  const handleContinueCourse = (courseId: number) => {
    navigate('/platform/course-player');
  };

  const getProgress = (courseId: number) => {
    return courseProgress[courseId]?.progress || 0;
  };

  return (
    <div className={`p-8 ${colors.bg.primary} min-h-screen`}>
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-2xl font-bold ${colors.text.primary} mb-6`}>Kursy i Szkolenia</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {courses.filter(course => course.unlocked && getProgress(course.id) > 0).map(course => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${colors.bg.secondary} rounded-xl overflow-hidden border ${colors.border.primary}`}
            >
              <div className="relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-${colors.bg.secondary} to-transparent`}></div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className={`${colors.bg.accent} ${colors.text.primary} text-xs px-2 py-1 rounded-full`}>W trakcie</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-xl font-bold ${colors.text.primary}`}>{course.title}</h3>
                  <div className="flex items-center">
                    <Star className={`w-4 h-4 ${colors.text.star} fill-yellow-500`} />
                    <span className={`${colors.text.primary} ml-1`}>{course.rating}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-4 ${colors.text.secondary} text-sm mb-4`}>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons} lekcji</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={colors.text.secondary}>Postęp</span>
                    <span className={colors.text.accent}>{getProgress(course.id)}%</span>
                  </div>
                  <div className={`w-full ${colors.bg.tertiary} rounded-full h-2`}>
                    <div 
                      className={`${colors.bg.accent} h-2 rounded-full`}
                      style={{ width: `${getProgress(course.id)}%` }}
                    ></div>
                  </div>
                </div>
                <button 
                  onClick={() => handleContinueCourse(course.id)}
                  className={`w-full ${colors.button.primary} ${colors.text.primary} rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2`}
                >
                  <Play className="w-5 h-5" />
                  Kontynuuj kurs
                </button>
              </div>
            </motion.div>
          ))}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${colors.bg.secondary} rounded-xl overflow-hidden border ${colors.border.primary}`}
          >
            <div className="p-6">
              <h3 className={`text-xl font-bold ${colors.text.primary} mb-4`}>Rekomendowane dla Ciebie</h3>
              <p className={`${colors.text.secondary} mb-6`}>
                Na podstawie Twojego profilu i aktywności, te kursy mogą Cię zainteresować:
              </p>
              <div className="space-y-4">
                {courses.filter(course => !course.unlocked).slice(0, 2).map(course => (
                  <div key={course.id} className={`flex gap-4 p-3 rounded-lg hover:${colors.bg.hover} transition-colors`}>
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className={`${colors.text.primary} font-medium`}>{course.title}</h4>
                      <div className={`flex items-center gap-2 text-xs ${colors.text.secondary}`}>
                        <Clock className="w-3 h-3" />
                        <span>{course.duration}</span>
                        <Star className={`w-3 h-3 ${colors.text.star} fill-yellow-500`} />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className={`w-full mt-4 border ${colors.border.accent} ${colors.text.accent} hover:${colors.bg.accentHover} rounded-lg py-2 font-medium transition-colors`}>
                Zobacz wszystkie rekomendacje
              </button>
            </div>
          </motion.div>
        </div>
        
        <h2 className={`text-xl font-bold ${colors.text.primary} mb-6`}>Wszystkie kursy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${colors.bg.secondary} rounded-xl overflow-hidden border ${colors.border.primary}`}
            >
              <div className="relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {!course.unlocked && (
                  <div className={`absolute inset-0 ${colors.bg.overlay} backdrop-blur-sm flex flex-col items-center justify-center`}>
                    <Lock className={`w-10 h-10 ${colors.text.primary} mb-2`} />
                    <p className={`${colors.text.primary} font-medium`}>Kurs zablokowany</p>
                    <p className={`${colors.text.accent} font-bold mt-1`}>{course.price}</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`${colors.text.primary} font-medium`}>{course.title}</h3>
                  <div className="flex items-center">
                    <Star className={`w-4 h-4 ${colors.text.star} fill-yellow-500`} />
                    <span className={`${colors.text.primary} ml-1`}>{course.rating}</span>
                  </div>
                </div>
                <p className={`${colors.text.secondary} text-sm mb-4 line-clamp-2`}>{course.description}</p>
                <div className={`flex items-center gap-4 ${colors.text.secondary} text-xs mb-4`}>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{course.lessons} lekcji</span>
                  </div>
                </div>
                {course.unlocked ? (
                  <button 
                    onClick={() => handleContinueCourse(course.id)}
                    className={`w-full ${colors.button.primary} ${colors.text.primary} rounded-lg py-2 font-medium transition-colors flex items-center justify-center gap-2 text-sm`}
                  >
                    {getProgress(course.id) > 0 ? (
                      <>
                        <Play className="w-4 h-4" />
                        Kontynuuj
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Rozpocznij kurs
                      </>
                    )}
                  </button>
                ) : (
                  <button className={`w-full ${colors.button.secondary} ${colors.text.primary} rounded-lg py-2 font-medium transition-colors flex items-center justify-center gap-2 text-sm`}>
                    <Lock className="w-4 h-4" />
                    Odblokuj za {course.price}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className={`mt-16 ${colors.bg.secondary} rounded-xl p-8 border ${colors.border.primary}`}>
          <h2 className={`text-xl font-bold ${colors.text.primary} mb-6 text-center`}>Dlaczego warto inwestować w kursy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`${colors.effects.active} p-3 rounded-full`}>
                  <BookOpen className={`w-6 h-6 ${colors.text.accent}`} />
                </div>
              </div>
              <h3 className={`${colors.text.primary} font-medium mb-2`}>Wiedza ekspercka</h3>
              <p className={`${colors.text.secondary} text-sm`}>Ucz się od najlepszych specjalistów w branży nieruchomości</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`${colors.effects.active} p-3 rounded-full`}>
                  <CheckCircle className={`w-6 h-6 ${colors.text.accent}`} />
                </div>
              </div>
              <h3 className={`${colors.text.primary} font-medium mb-2`}>Certyfikaty</h3>
              <p className={`${colors.text.secondary} text-sm`}>Otrzymuj certyfikaty potwierdzające zdobyte umiejętności</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`${colors.effects.active} p-3 rounded-full`}>
                  <Download className={`w-6 h-6 ${colors.text.accent}`} />
                </div>
              </div>
              <h3 className={`${colors.text.primary} font-medium mb-2`}>Materiały dodatkowe</h3>
              <p className={`${colors.text.secondary} text-sm`}>Pobieraj szablony, e-booki i narzędzia do pracy</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`${colors.effects.active} p-3 rounded-full`}>
                  <Star className={`w-6 h-6 ${colors.text.accent}`} />
                </div>
              </div>
              <h3 className={`${colors.text.primary} font-medium mb-2`}>Dostęp na zawsze</h3>
              <p className={`${colors.text.secondary} text-sm`}>Wracaj do materiałów kiedy tylko potrzebujesz</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Courses;
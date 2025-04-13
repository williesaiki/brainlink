import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, Clock, Download, BookOpen, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

// Mock course data
const courseData = {
  id: 1,
  title: "Podstawy Pośrednictwa Nieruchomości",
  description: "Kompletny kurs wprowadzający do zawodu pośrednika nieruchomości. Poznaj prawne, marketingowe i praktyczne aspekty pracy w branży.",
  instructor: "Anna Kowalska",
  modules: [
    {
      id: 1,
      title: "Wprowadzenie do pośrednictwa nieruchomości",
      lessons: [
        {
          id: 1,
          title: "Czym jest pośrednictwo nieruchomości?",
          duration: "12:30",
          completed: true,
          current: false
        },
        {
          id: 2,
          title: "Rynek nieruchomości w Polsce - przegląd",
          duration: "18:45",
          completed: true,
          current: false
        },
        {
          id: 3,
          title: "Podstawy prawne zawodu pośrednika",
          duration: "22:15",
          completed: false,
          current: true
        }
      ]
    },
    {
      id: 2,
      title: "Marketing nieruchomości",
      lessons: [
        {
          id: 4,
          title: "Fotografia nieruchomości",
          duration: "15:20",
          completed: false,
          current: false
        },
        {
          id: 5,
          title: "Tworzenie atrakcyjnych opisów",
          duration: "14:10",
          completed: false,
          current: false
        },
        {
          id: 6,
          title: "Strategie promocji online",
          duration: "20:05",
          completed: false,
          current: false
        }
      ]
    },
    {
      id: 3,
      title: "Proces sprzedaży nieruchomości",
      lessons: [
        {
          id: 7,
          title: "Wycena nieruchomości",
          duration: "25:30",
          completed: false,
          current: false
        },
        {
          id: 8,
          title: "Prezentacja nieruchomości klientom",
          duration: "18:15",
          completed: false,
          current: false
        },
        {
          id: 9,
          title: "Negocjacje i finalizacja transakcji",
          duration: "28:40",
          completed: false,
          current: false
        }
      ]
    }
  ],
  resources: [
    {
      id: 1,
      title: "Szablon umowy pośrednictwa",
      type: "PDF",
      size: "420 KB"
    },
    {
      id: 2,
      title: "Checklist prezentacji nieruchomości",
      type: "PDF",
      size: "215 KB"
    },
    {
      id: 3,
      title: "Kalkulator wyceny nieruchomości",
      type: "Excel",
      size: "1.2 MB"
    }
  ]
};

function CoursePlayer() {
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);
  const [currentLesson, setCurrentLesson] = useState({
    moduleId: 1,
    lessonId: 3
  });
  const [completedLessons, setCompletedLessons] = useState<{[key: number]: boolean}>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { updateCourseProgress } = useAuthStore();

  // Load completed lessons from store on mount
  useEffect(() => {
    const storedProgress = useAuthStore.getState().courseProgress[courseData.id] || {};
    setCompletedLessons(storedProgress.completedLessons || { 1: true, 2: true });
  }, []);

  // Find current lesson data
  const currentModule = courseData.modules.find(m => m.id === currentLesson.moduleId);
  const currentLessonData = currentModule?.lessons.find(l => l.id === currentLesson.lessonId);

  const toggleModule = (moduleId: number) => {
    if (expandedModules.includes(moduleId)) {
      setExpandedModules(expandedModules.filter(id => id !== moduleId));
    } else {
      setExpandedModules([...expandedModules, moduleId]);
    }
  };

  const selectLesson = (moduleId: number, lessonId: number) => {
    setCurrentLesson({ moduleId, lessonId });
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const toggleLessonCompletion = (lessonId: number) => {
    const newCompletedLessons = {
      ...completedLessons,
      [lessonId]: !completedLessons[lessonId]
    };
    
    setCompletedLessons(newCompletedLessons);
    
    // Calculate progress and save to store
    const totalLessons = courseData.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completedCount = Object.values(newCompletedLessons).filter(Boolean).length;
    const progressPercentage = Math.round((completedCount / totalLessons) * 100);
    
    updateCourseProgress(courseData.id, {
      completedLessons: newCompletedLessons,
      progress: progressPercentage
    });
  };

  // Calculate overall progress
  const totalLessons = courseData.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="bg-navy-950 min-h-screen relative">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-navy-900 p-2 rounded-lg text-white hover:bg-navy-800 transition-colors"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile back button */}
      <div className="lg:hidden fixed top-4 right-4 z-40">
        <button 
          onClick={() => navigate('/platform/courses')}
          className="bg-navy-900 p-2 rounded-lg text-white hover:bg-navy-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar with lessons - Mobile friendly */}
        <div 
          className={`fixed lg:static top-0 left-0 h-screen w-full lg:w-80 bg-navy-900 border-r border-navy-800 overflow-y-auto z-40 transform lg:transform-none transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-navy-800 mt-14 lg:mt-0">
            <button 
              onClick={() => navigate('/platform/courses')}
              className="flex items-center text-gray-400 hover:text-white mb-4 lg:block hidden"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do kursów
            </button>
            <h2 className="text-lg font-bold text-white">{courseData.title}</h2>
            <div className="flex items-center mt-2">
              <div className="text-sm text-gray-400">Postęp: {progressPercentage}%</div>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-2 mt-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 pb-24 lg:pb-4">
            {courseData.modules.map(module => (
              <div key={module.id} className="mb-4">
                <button 
                  onClick={() => toggleModule(module.id)}
                  className="flex items-center justify-between w-full text-left py-2 px-3 rounded-lg hover:bg-navy-800 transition-colors"
                >
                  <span className="text-white font-medium">{module.title}</span>
                  {expandedModules.includes(module.id) ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {expandedModules.includes(module.id) && (
                  <div className="ml-2 mt-2 space-y-1">
                    {module.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(module.id, lesson.id)}
                        className={`flex items-center w-full text-left py-2 px-3 rounded-lg transition-colors ${
                          currentLesson.moduleId === module.id && currentLesson.lessonId === lesson.id
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'hover:bg-navy-800 text-gray-400'
                        }`}
                      >
                        <div 
                          className="mr-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLessonCompletion(lesson.id);
                          }}
                        >
                          {completedLessons[lesson.id] ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{lesson.title}</div>
                          <div className="flex items-center text-xs mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {lesson.duration}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto pt-20 lg:pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                {currentLessonData?.title}
              </h1>
              <div className="flex items-center text-gray-400 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>{currentLessonData?.duration}</span>
              </div>
            </div>

            {/* Video player */}
            <div className="bg-navy-900 rounded-xl overflow-hidden mb-8 aspect-video relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-navy-800 p-4 rounded-lg inline-block mb-4">
                    <BookOpen className="w-12 h-12 text-emerald-500" />
                  </div>
                  <p className="text-white text-lg">Lekcja: {currentLessonData?.title}</p>
                  <p className="text-gray-400 mt-2">
                    W rzeczywistej implementacji tutaj byłby odtwarzacz wideo z materiałem kursu.
                  </p>
                </div>
              </div>
            </div>

            {/* Lesson completion */}
            <div className="bg-navy-900 rounded-xl p-6 border border-navy-800 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Status lekcji</h3>
                <button 
                  onClick={() => toggleLessonCompletion(currentLesson.lessonId)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    completedLessons[currentLesson.lessonId]
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-navy-800 text-white hover:bg-navy-700'
                  }`}
                >
                  {completedLessons[currentLesson.lessonId] ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Ukończone
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Oznacz jako ukończone
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-navy-900 rounded-xl p-6 border border-navy-800">
              <h3 className="text-lg font-semibold text-white mb-4">Materiały dodatkowe</h3>
              <div className="space-y-3">
                {courseData.resources.map(resource => (
                  <div 
                    key={resource.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-navy-800 rounded-lg hover:bg-navy-700 transition-colors gap-3"
                  >
                    <div className="flex items-center">
                      <div className="bg-emerald-500/20 p-2 rounded-lg mr-3">
                        <Download className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-white">{resource.title}</div>
                        <div className="text-xs text-gray-400">{resource.type} • {resource.size}</div>
                      </div>
                    </div>
                    <button className="text-emerald-500 hover:text-emerald-400 transition-colors sm:text-right">
                      Pobierz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePlayer;
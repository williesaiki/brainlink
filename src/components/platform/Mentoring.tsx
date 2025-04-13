import React from 'react';
import { Lock, Star, Calendar, Users } from 'lucide-react';
import { colors } from '../../config/colors';

const mentors = [
  {
    name: "Marek Kowalski",
    role: "Property Investment Expert",
    experience: "12 lat doświadczenia",
    rating: 4.8,
    reviews: 96,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80",
    available: false
  },
  {
    name: "Anna Nowak",
    role: "Senior Real Estate Advisor",
    experience: "15 lat doświadczenia",
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
    available: true
  }
];

function Mentoring() {
  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className={`relative ${colors.card.stats} rounded-xl p-8 mb-8 overflow-hidden`}>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4">Program Mentoringowy</h2>
          <p className={`${colors.text.muted} mb-6 max-w-2xl`}>
            Odblokuj pełen potencjał swojej kariery w nieruchomościach dzięki indywidualnemu mentoringowi 
            od najlepszych ekspertów w branży.
          </p>
          <div className="flex gap-4">
            <button className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2`}>
              <Lock className="w-5 h-5" />
              Odblokuj Dostęp
            </button>
            <button className={`${colors.button.secondary} px-6 py-2 rounded-lg`}>
              Dowiedz się więcej
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-600 transform rotate-12 translate-x-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {mentors.map((mentor, index) => (
          <div key={index} className={`${colors.card.mentor} p-6`}>
            <div className="flex gap-6">
              <img 
                src={mentor.image} 
                alt={mentor.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mentor.available 
                      ? `${colors.bg.active} ${colors.text.accent}` 
                      : `${colors.bg.secondary} ${colors.text.muted}`
                  }`}>
                    {mentor.available ? 'Dostępny' : 'Zajęty'}
                  </span>
                </div>
                <p className={`${colors.text.muted} font-medium mb-1`}>{mentor.role}</p>
                <p className={`${colors.text.muted} text-sm mb-3`}>{mentor.experience}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Star className={`w-4 h-4 ${colors.text.accent} fill-current mr-1`} />
                    <span className="text-white">{mentor.rating}</span>
                    <span className={`${colors.text.muted} ml-1`}>({mentor.reviews})</span>
                  </div>
                  <button className={`${colors.text.muted} hover:text-white transition-colors flex items-center gap-1`}>
                    <Calendar className="w-4 h-4" />
                    Umów spotkanie
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Mentoring;
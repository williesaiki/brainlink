import React, { useState, useEffect } from 'react';
import { Camera, FileEdit, Share2, TrendingUp } from 'lucide-react';
import { colors } from '../../config/colors';
import { auth } from '../../lib/firebase'; // Adjust the import path based on your project structure

const stats = [
  {
    label: "Wyświetlenia profilu",
    value: "1,234",
    change: "+12%",
    icon: TrendingUp
  },
  {
    label: "Zapisane oferty",
    value: "56",
    change: "+3",
    icon: Share2
  }
];

function PersonalBrand() {
  const [currentUser, setCurrentUser] = useState(null); // Initially null to indicate loading
  const [loading, setLoading] = useState(true); // Add loading state to handle async

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user); // Set user (could be null if not authenticated)
      setLoading(false); // Mark loading as complete
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-[#000008] min-h-screen">
        <p className="text-white">Ładowanie...</p>
      </div>
    ); // Show loading state while waiting for auth
  }

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className={`${colors.card.stats} rounded-xl overflow-hidden mb-8`}>
        <div className="px-8 py-8">
          <div className="flex justify-between items-end">
            <div className="flex items-end gap-6">
              <div className="relative">
                <img
                  src={currentUser?.photoURL || "https://cdn.prod.website-files.com/64f34c2162f4f8d189da8e30/65398d6cab58c6a59d34b6da_LZINDBAc16db-RldFsZBL7TlMUlP1WWkFzWjYF8YCAI-p-1080.jpeg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-xl border-4 border-[#010220]"
                />
                <button className={`absolute bottom-2 right-2 ${colors.button.secondary} p-1 rounded-full`}>
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {currentUser?.displayName || 'Użytkownik'}
                </h1>
                <p className="text-gray-400">Agent Nieruchomości Premium</p>
              </div>
            </div>
            <button className={`${colors.button.primary} px-6 py-2 flex items-center gap-2`}>
              <FileEdit className="w-5 h-5" />
              Edytuj Profil
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${colors.card.stats} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">{stat.label}</span>
              <stat.icon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className="text-gray-400 mb-1">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`${colors.card.stats} rounded-xl p-6`}>
        <h2 className="text-xl font-bold text-white mb-6">O mnie</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400">
            Specjalizuję się w nieruchomościach premium na terenie Warszawy. 
            Z pasją pomagam klientom znaleźć ich wymarzone domy i inwestycje. 
            Moje podejście opiera się na głębokim zrozumieniu potrzeb klienta 
            i wieloletnim doświadczeniu w branży nieruchomości.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PersonalBrand;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users2, Building2, TrendingUp, Award, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, count, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { colors } from '../config/colors';
import useAuthStore from '../store/authStore';

interface DashboardStats {
  totalUsers: number;
  totalOffers: number;
  totalTransactions: number;
  activeAgents: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOffers: 0,
    totalTransactions: 0,
    activeAgents: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch users count
      const usersSnapshot = await getDocs(collection(db, 'user_profiles'));
      const usersCount = usersSnapshot.size;

      // Fetch active agents
      const agentsQuery = query(collection(db, 'user_profiles'));
      const agentsSnapshot = await getDocs(agentsQuery);
      const agentsCount = agentsSnapshot.size;

      // Fetch offers count
      const offersSnapshot = await getDocs(collection(db, 'offers'));
      const offersCount = offersSnapshot.size;

      // Fetch recent activities
      const activitiesQuery = query(collection(db, 'activities'));
      const activitiesSnapshot = await getDocs(activitiesQuery);
      
      const recentActivities: Activity[] = [];
      activitiesSnapshot.forEach(doc => {
        const data = doc.data();
        recentActivities.push({
          id: doc.id,
          type: data.type,
          description: data.description,
          created_at: data.created_at.toDate().toISOString()
        });
      });

      setStats({
        totalUsers: usersCount || 0,
        totalOffers: offersCount || 0,
        totalTransactions: 0, // This would come from a transactions table
        activeAgents: agentsCount || 0
      });

      setActivities(recentActivities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Błąd podczas ładowania danych');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin');
      toast.success('Wylogowano pomyślnie');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Błąd podczas wylogowywania');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000008] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000008] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Panel Administracyjny</h1>
          <button
            onClick={handleLogout}
            className="bg-[#010220] hover:bg-[#010220]/80 text-red-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Wyloguj się
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Użytkownicy</span>
              <Users2 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.totalUsers}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Oferty</span>
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.totalOffers}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Transakcje</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.totalTransactions.toLocaleString()} PLN
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Aktywni agenci</span>
              <Award className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.activeAgents}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`${colors.card.stats} rounded-xl p-6`}>
            <h2 className="text-xl font-semibold text-white mb-6">Ostatnie aktywności</h2>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 border-b border-[#E5E5E5]/10">
                    <div>
                      <p className="text-white">{activity.description}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Users2 className="w-5 h-5 text-gray-400" />
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-6">
                  Brak ostatnich aktywności
                </div>
              )}
            </div>
          </div>

          <div className={`${colors.card.stats} rounded-xl p-6`}>
            <h2 className="text-xl font-semibold text-white mb-6">Statystyki systemu</h2>
            <div className="space-y-4">
              {[
                { label: 'Obciążenie serwera', value: 65 },
                { label: 'Wykorzystanie pamięci', value: 45 },
                { label: 'Ruch sieciowy', value: 80 }
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-[#E5E5E5]/10">
                  <div className="flex-1 mr-4">
                    <p className="text-white">{stat.label}</p>
                    <div className="w-full bg-[#010220] rounded-full h-2 mt-2">
                      <div 
                        className="bg-gray-400 h-2 rounded-full" 
                        style={{ width: `${stat.value}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-gray-400">{stat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
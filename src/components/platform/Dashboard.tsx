import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Trophy,
  UserCircle,
  Settings, 
  HelpCircle,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Users2,
  Shield,
  Plus,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Wrench,
  ListTodo,
  StickyNote,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import Overview from './Overview';
import Offers from './Offers';
import Mentoring from './Mentoring';
import PersonalBrand from './PersonalBrand';
import Profile from './Profile';
import SettingsComponent from './Settings';
import Help from './Help';
import Courses from './Courses';
import CoursePlayer from './CoursePlayer';
import Clients from './Clients';
import ClientDetails from './ClientDetails';
import BuyingClients from './BuyingClients';
import SellingClients from './SellingClients';
import ClientDatabase from './ClientDatabase';
import AdminDashboard from '../admin/AdminDashboard';
import Pozysk from './Pozysk';
import PozyskForm from './PozyskForm';
import TaskList from './tools/TaskList';
import Notes from './tools/Notes';
import OfferAnalysis from './tools/OfferAnalysis';
import Calendar from './Calendar';
import { colors } from '../../config/colors';
import { auth } from '../../lib/firebase';
import { userProfileService } from '../../services/userProfileService';
import type { UserProfile } from '../../services/userProfileService';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Update current user when auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        loadUserProfile();
      } else {
        setUserProfile(null);
      }
    });

    // Subscribe to profile updates
    const unsubscribeProfile = userProfileService.subscribe(() => {
      loadUserProfile();
    });

    return () => {
      unsubscribe();
      unsubscribeProfile();
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await userProfileService.getProfile();
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = currentUser?.email === 'admin@gmail.com';

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      if (prev.includes(section)) {
        return prev.filter(s => s !== section);
      }
      return [section];
    });
  };

  const navigation = [
    ...(isAdmin ? [
      { name: 'Panel Administracyjny', icon: Shield, path: 'admin' }
    ] : []),
    { name: 'Panel Zarządzania', icon: LayoutDashboard, path: '' },
    { name: 'Kalendarz', icon: CalendarIcon, path: 'calendar' },
    { name: 'Twoje Oferty', icon: Building2, path: 'offers' },
    { name: 'Pozysk', icon: Plus, path: 'pozysk' },
    {
      name: 'Klienci',
      icon: Users2,
      section: 'clients',
      children: [
        { name: 'Kupujący', path: 'clients/buying' },
        { name: 'Sprzedający', path: 'clients/selling' },
        { name: 'Baza klientów', path: 'clients/database' }
      ]
    },
    
    {
      name: 'Narzędzia',
      icon: Wrench,
      section: 'tools',
      children: [
        { name: 'Lista zadań', path: 'tools/tasks', icon: ListTodo },
        { name: 'Notatki', path: 'tools/notes', icon: StickyNote },
        { name: 'Analiza ofert', path: 'tools/analysis', icon: Sparkles }
      ]
    },
    {
      name: 'Rozwój Osobisty',
      icon: BookOpen,
      section: 'development',
      children: [
        { name: 'Kursy', path: 'courses', icon: GraduationCap },
        { name: 'Mentoring', path: 'mentoring', icon: Users },
        { name: 'Marka Osobista', path: 'personal-brand', icon: Trophy }
      ]
    },
    { name: 'Profil', icon: UserCircle, path: 'profile' },
    { name: 'Ustawienia', icon: Settings, path: 'settings' },
    { name: 'Pomoc', icon: HelpCircle, path: 'help' }
  ];

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isPathActive = (path: string) => {
    if (path === '') {
      return location.pathname === '/platform';
    }
    return location.pathname.startsWith(`/platform/${path}`);
  };

  const isSectionActive = (children: { path: string }[]) => {
    return children.some(child => isPathActive(child.path));
  };

  return (
    <div className="flex h-screen bg-[#000008] overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#000008] p-2 rounded-lg text-white hover:bg-gray-800 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div 
        className={`fixed lg:relative top-0 left-0 h-screen w-64 bg-[#000008] border-r border-gray-800 flex flex-col z-40 transform lg:transform-none transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex-grow overflow-y-auto">
            <div className="flex items-center space-x-2 mb-8">
              <img
                src={userProfile?.photoURL || currentUser?.photoURL || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <span className="text-white font-semibold block">
                  {userProfile?.displayName || currentUser?.displayName || 'Użytkownik'}
                </span>
                <span className="text-gray-400 text-sm">
                  {userProfile?.email || currentUser?.email}
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => (
                item.children ? (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => toggleSection(item.section)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isSectionActive(item.children)
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="text-left">{item.name}</span>
                      </div>
                      {expandedSections.includes(item.section!) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.includes(item.section) && (
                       <div className="pl-4 space-y-1">
                         {item.children.map((child) => (
                           <NavLink
                             key={child.path}
                             to={child.path}
                             onClick={closeSidebar}
                             className={({ isActive }) =>
                               `flex items-center text-left px-4 py-2 rounded-lg transition-colors ${
                                 isActive
                                   ? 'bg-gray-800 text-white'
                                   : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                               }`
                             }
                           >
                             {child.icon && <child.icon className="w-4 h-4 mr-3" />}
                             <span>{child.name}</span>
                           </NavLink>
                         ))}
                       </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </NavLink>
                )
              ))}
            </nav>
          </div>

          <div className="p-6 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Wyloguj się</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-[#000008]">
        <div className="pt-20 lg:pt-0">
          <Routes>
            {isAdmin && <Route path="admin" element={<AdminDashboard />} />}
            <Route path="" element={<Overview />} /> 
            <Route path="calendar" element={<Calendar />} />
            <Route path="offers" element={<Offers />} />
            <Route path="pozysk" element={<Pozysk />} />
            <Route path="pozysk/new" element={<PozyskForm />} />
            <Route path="pozysk/:id" element={<PozyskForm />} />
           
            <Route path="clients/buying" element={<BuyingClients />} />
            <Route path="clients/selling" element={<SellingClients />} />
            <Route path="clients/database" element={<ClientDatabase />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="tools/tasks" element={<TaskList />} />
            <Route path="tools/notes" element={<Notes />} />
            <Route path="tools/analysis" element={<OfferAnalysis />} />
            <Route path="courses" element={<Courses />} />
            <Route path="course-player" element={<CoursePlayer />} />
            <Route path="mentoring" element={<Mentoring />} />
            <Route path="personal-brand" element={<PersonalBrand />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<SettingsComponent />} />
            <Route path="help" element={<Help />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
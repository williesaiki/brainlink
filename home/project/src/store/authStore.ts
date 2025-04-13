import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface CourseProgressData {
  completedLessons: {[key: number]: boolean};
  progress: number;
}

interface CourseProgress {
  [courseId: number]: CourseProgressData;
}

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  specialization: string;
  experience: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    role: string;
    profile: UserProfile;
  } | null;
  courseProgress: CourseProgress;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCourseProgress: (courseId: number, data: CourseProgressData) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

// Mock users for development and testing
const MOCK_USERS = [
  {
    id: 'user-1',
    username: 'lukasz',
    password: 'Test123!',
    role: 'user',
    profile: {
      fullName: 'Łukasz Paziewski',
      email: 'lukasz@example.com',
      phone: '+48 123 456 789',
      location: 'Warszawa',
      specialization: 'Agent Premium',
      experience: '5 lat'
    }
  },
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    profile: {
      fullName: 'Administrator',
      email: 'admin@estateacademy.pl',
      phone: '+48 987 654 321',
      location: 'Warszawa',
      specialization: 'Admin',
      experience: '10 lat'
    }
  }
];

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      courseProgress: {
        1: {
          completedLessons: { 1: true, 2: true },
          progress: 35
        }
      },
      login: async (email: string, password: string) => {
        try {
          // Check if we're using Supabase or mock authentication
          if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_SUPABASE_URL) {
            // Mock login for development
            const mockUser = MOCK_USERS.find(
              user => user.username === email && user.password === password
            );
            
            if (mockUser) {
              set({
                isAuthenticated: true,
                user: {
                  id: mockUser.id,
                  username: mockUser.username,
                  role: mockUser.role,
                  profile: mockUser.profile
                }
              });
              toast.success('Logged in successfully');
              return true;
            }
            
            throw new Error('Invalid credentials');
          } else {
            // Real Supabase authentication
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (error) throw error;
            
            if (!data.user) {
              throw new Error('User not found');
            }
            
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (profileError && profileError.code !== 'PGRST116') {
              // PGRST116 means no rows returned, which is fine for new users
              throw profileError;
            }
            
            // Set authenticated user state
            set({
              isAuthenticated: true,
              user: {
                id: data.user.id,
                username: email,
                role: data.user.app_metadata?.role || 'user',
                profile: {
                  fullName: profile?.full_name || '',
                  email: email,
                  phone: profile?.phone || '',
                  location: profile?.location || '',
                  specialization: profile?.specialization || '',
                  experience: profile?.experience || ''
                }
              }
            });
            
            toast.success('Logged in successfully');
            return true;
          }
        } catch (error: any) {
          console.error('Login error:', error);
          toast.error(error.message || 'Login failed');
          return false;
        }
      },
      adminLogin: async (email: string, password: string) => {
        try {
          // Check if we're using Supabase or mock authentication
          if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_SUPABASE_URL) {
            // Mock admin login for development
            const adminUser = MOCK_USERS.find(
              user => user.username === email && user.password === password && user.role === 'admin'
            );
            
            if (adminUser) {
              set({
                isAuthenticated: true,
                user: {
                  id: adminUser.id,
                  username: adminUser.username,
                  role: 'admin',
                  profile: adminUser.profile
                }
              });
              toast.success('Logged in as administrator');
              return true;
            }
            
            throw new Error('Invalid admin credentials');
          } else {
            // Real Supabase authentication
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (error) throw error;
            
            if (!data.user) {
              throw new Error('User not found');
            }
            
            // Check if user is admin
            if (data.user.app_metadata?.role !== 'admin') {
              throw new Error('Unauthorized: Not an admin');
            }
            
            // Fetch admin user profile
            const { data: adminData, error: adminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (adminError && adminError.code !== 'PGRST116') {
              throw adminError;
            }
            
            // Set authenticated admin user state
            set({
              isAuthenticated: true,
              user: {
                id: data.user.id,
                username: email,
                role: 'admin',
                profile: {
                  fullName: adminData?.username || '',
                  email: email,
                  phone: '',
                  location: '',
                  specialization: '',
                  experience: ''
                }
              }
            });
            
            toast.success('Logged in as administrator');
            return true;
          }
        } catch (error: any) {
          console.error('Admin login error:', error);
          toast.error(error.message || 'Admin login failed');
          return false;
        }
      },
      signup: async (email: string, password: string) => {
        try {
          // Check if we're using Supabase or mock authentication
          if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_SUPABASE_URL) {
            // Mock signup for development
            const existingUser = MOCK_USERS.find(user => user.username === email);
            if (existingUser) {
              throw new Error('User already exists');
            }
            
            toast.success('Account created successfully! You can now log in.');
            return true;
          } else {
            // Real Supabase signup
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  role: 'user'
                }
              }
            });
            
            if (error) throw error;
            
            if (!data.user) {
              throw new Error('Failed to create user');
            }
            
            // Create user profile
            await supabase
              .from('user_profiles')
              .insert([{
                id: data.user.id,
                full_name: '',
                email: email
              }]);
            
            toast.success('Account created successfully! You can now log in.');
            return true;
          }
        } catch (error: any) {
          console.error('Signup error:', error);
          toast.error(error.message || 'Failed to create account');
          return false;
        }
      },
      logout: async () => {
        try {
          // Check if we're using Supabase or mock authentication
          if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_SUPABASE_URL) {
            // Mock logout for development
            set({
              isAuthenticated: false,
              user: null
            });
          } else {
            // Real Supabase logout
            await supabase.auth.signOut();
            
            set({
              isAuthenticated: false,
              user: null
            });
          }
          
          toast.success('Logged out successfully');
        } catch (error: any) {
          console.error('Logout error:', error);
          toast.error('Error during logout');
        }
      },
      updateCourseProgress: (courseId: number, data: CourseProgressData) => {
        set((state) => ({
          courseProgress: {
            ...state.courseProgress,
            [courseId]: data
          }
        }));
      },
      updateUserProfile: (profile: Partial<UserProfile>) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            profile: {
              ...state.user.profile,
              ...profile
            }
          } : null
        }));
        
        // Update profile in Supabase if available
        if (import.meta.env.VITE_SUPABASE_URL && state.user) {
          supabase
            .from('user_profiles')
            .update({
              full_name: profile.fullName,
              phone: profile.phone,
              location: profile.location,
              specialization: profile.specialization,
              experience: profile.experience
            })
            .eq('id', state.user.id)
            .then(({ error }) => {
              if (error) console.error('Error updating profile:', error);
            });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../lib/auth';

interface CourseProgressData {
  completedLessons: {[key: number]: boolean};
  progress: number;
}

interface CourseProgress {
  [courseId: number]: CourseProgressData;
}

interface AuthState {
  courseProgress: CourseProgress;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCourseProgress: (courseId: number, data: CourseProgressData) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      courseProgress: {
        1: {
          completedLessons: { 1: true, 2: true },
          progress: 35
        }
      },
      login: async (email: string, password: string) => {
        return authService.login(email, password);
      },
      signup: async (email: string, password: string) => {
        return authService.signup(email, password);
      },
      logout: async () => {
        await authService.logout();
        set({ courseProgress: {} });
      },
      updateCourseProgress: (courseId: number, data: CourseProgressData) => {
        set((state) => ({
          courseProgress: {
            ...state.courseProgress,
            [courseId]: data
          }
        }));
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
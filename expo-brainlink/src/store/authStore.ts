import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../lib/authService';

interface AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      login: async (email, password) => {
        return authService.login(email, password);
      },
      signup: async (email, password) => {
        return authService.signup(email, password);
      },
      logout: async () => {
        await authService.logout();
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
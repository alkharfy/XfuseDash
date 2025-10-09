import { create } from 'zustand';
import { User } from 'firebase/auth';
import type { UserRole } from '@/lib/types';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set(state => ({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false,
  })),
  setRole: (role) => set({ role }),
  logout: () => set({ user: null, role: null, isAuthenticated: false, isLoading: false }),
}));

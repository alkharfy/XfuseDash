import { create } from 'zustand';
import { User, UserRole } from '@/lib/types';
import { mockUsers } from '@/lib/data';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

// In a real app, you would fetch the user from a session or token.
// Here, we'll simulate it by allowing login with just an email for demo purposes.
export const useAuth = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true, // Initially true until we've "checked" for a user
  login: async (email: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email === email);
        if (foundUser) {
          set({ user: foundUser, role: foundUser.role, isAuthenticated: true, isLoading: false });
          resolve(foundUser);
        } else {
          reject(new Error("User not found"));
        }
      }, 500);
    });
  },
  logout: () => {
    set({ user: null, role: null, isAuthenticated: false, isLoading: false });
  },
}));

// Simulate checking for an authenticated user on app load
setTimeout(() => {
    // To test different roles, you can change the email here.
    // For example, use 'pr@marketflow.com' to log in as a PR user.
    useAuth.getState().login('moderator@marketflow.com'); 
}, 100);

import { create } from 'zustand';
import { User } from '@/types/domain';
import { services } from '@/services';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  hydrate: () => Promise<void>;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  hydrate: async () => {
    set({ status: 'loading' });
    const user = await services.auth.getCurrentUser();
    set({ user, status: user ? 'authenticated' : 'unauthenticated' });
  },

  setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),

  signOut: async () => {
    await services.auth.signOut();
    set({ user: null, status: 'unauthenticated' });
  },
}));

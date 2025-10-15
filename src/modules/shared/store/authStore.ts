import { create } from 'zustand';

interface User {
  userId: number;
  username: string;
}

interface AuthState {
  user: User | null;
  access: string | null;
  setUser: (user: User) => void;
  setAccess: (access: string) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  access: null,
  setUser: (user: User) => set(state => ({ ...state, user })),
  setAccess: (access: string) => set(state => ({ ...state, access })),
}));

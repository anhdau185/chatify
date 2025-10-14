import { create } from 'zustand';

interface User {
  id: number;
  username: string;
}

interface AuthState {
  user: User | null;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
}));

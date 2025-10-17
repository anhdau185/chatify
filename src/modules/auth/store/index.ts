import { create } from 'zustand';

import type { User } from '../types';

interface AuthState {
  access: string | null;
  authenticatedUser: User | null;
  setAuth: (auth: { access: string; authenticatedUser: User }) => void;
  removeAuth: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  access: null,
  authenticatedUser: null,

  setAuth(auth) {
    set(state => ({
      ...state,
      ...auth,
    }));
  },

  removeAuth() {
    set(state => ({
      ...state,
      access: null,
      authenticatedUser: null,
    }));
  },
}));

import { create } from 'zustand';

import type { PublicUser } from '../types';

export interface AuthState {
  access: string | null;
  authenticatedUser: PublicUser | null;
  setAuth: (auth: { access: string; authenticatedUser: PublicUser }) => void;
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

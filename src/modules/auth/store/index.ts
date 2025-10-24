import { create } from 'zustand';

import type { PublicUser } from '../types';

interface AuthState {
  access: string | null;
  authenticatedUser: PublicUser | null;
}

interface AuthActions {
  setAuth: (newAuthData: {
    access: string;
    authenticatedUser: PublicUser;
  }) => void;
  removeAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>(set => ({
  access: null,
  authenticatedUser: null,

  setAuth(newAuthData) {
    set({
      access: newAuthData.access,
      authenticatedUser: newAuthData.authenticatedUser,
    });
  },

  removeAuth() {
    set({
      access: null,
      authenticatedUser: null,
    });
  },
}));

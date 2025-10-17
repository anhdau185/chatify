import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { deferSideEffect, endpoint } from '@shared/lib/utils';
import type { GeneralApiError } from '@shared/types';
import { useAuthStore } from '../store';
import type { LoginCredentials, LoginResponse, LogoutResponse } from '../types';

function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await fetch(endpoint('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!res.ok) {
        const { error: errorMsg } =
          await (res.json() as Promise<GeneralApiError>);
        throw new Error(errorMsg || 'Something went wrong on our end :(');
      }

      return res.json() as Promise<LoginResponse>;
    },

    onError({ message }) {
      toast.error(message);
    },

    onSuccess({ access, authenticatedUser }) {
      // save token & user to store after successful login
      setAuth({ access, authenticatedUser });
      toast.success(`Welcome back, ${authenticatedUser.name}! 🚀`);

      // finally, go to chat screen
      deferSideEffect(() => navigate('/chat', { replace: true }));
    },
  });
}

function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const removeAuth = useAuthStore(state => state.removeAuth);

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(endpoint('/auth/logout'), {
        credentials: 'include',
      });

      if (!res.ok) {
        const { error: errorMsg } =
          await (res.json() as Promise<GeneralApiError>);
        throw new Error(errorMsg || 'Something went wrong on our end :(');
      }

      return res.json() as Promise<LogoutResponse>;
    },

    onSettled() {
      // delete token & user from store after logging out as they are stale
      removeAuth();

      // data of 'auth/me' query (if there's any) is stale at this stage
      // therefore it must be invalidated to prevent the bug where the side effect of this query re-adds stale auth data back to zustand store
      // when user is redirected back to login screen
      queryClient.invalidateQueries({
        queryKey: ['auth/me'],
      });

      toast.info('Bye for now. See you soon 👋');

      // finally, go back to login screen
      deferSideEffect(() => navigate('/login', { replace: true }));
    },
  });
}

export { useLogin, useLogout };

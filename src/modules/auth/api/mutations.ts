import { useMutation } from '@tanstack/react-query';

import { endpoint } from '@shared/lib/utils';
import type { GeneralApiError } from '@shared/types';
import type { LoginCredentials, LoginResponse, LogoutResponse } from '../types';

const useLogin = ({
  onSuccess,
  onError,
}: {
  onSuccess: (data: LoginResponse) => void;
  onError: (error: Error) => void;
}) =>
  useMutation({
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
    onSuccess,
    onError,
  });

const useLogout = ({ onSettled }: { onSettled: () => void }) =>
  useMutation({
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
    onSettled,
  });

export { useLogin, useLogout };

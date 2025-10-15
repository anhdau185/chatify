import { useMutation } from '@tanstack/react-query';

import { LoginCredentials, LoginError, LoginResponse } from '../types';

export const useLogin = ({
  onSuccess,
  onError,
}: {
  onSuccess: (data: LoginResponse) => void;
  onError: (error: Error) => void;
}) =>
  useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const { error: errorMsg } = await (res.json() as Promise<LoginError>);
        throw new Error(errorMsg || 'Something went wrong on our end :(');
      }

      return res.json() as Promise<LoginResponse>;
    },
    onSuccess,
    onError,
  });

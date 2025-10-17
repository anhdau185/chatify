import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';

import { endpoint } from '@shared/lib/utils';
import type { GeneralApiError } from '@shared/types';
import { useAuthStore } from '../store';
import type { AuthResponse } from '../types';

function useAuthentication() {
  const setAuth = useAuthStore(state => state.setAuth);

  const query = useQuery({
    queryKey: ['auth/me'],
    queryFn: async () => {
      const res = await fetch(endpoint('/auth/me'), {
        credentials: 'include', // include jwt cookie for checking identity
      });

      if (!res.ok) {
        const { error: errorMsg } =
          await (res.json() as Promise<GeneralApiError>);
        throw new Error(errorMsg || 'Something went wrong on our end :(');
      }

      return res.json() as Promise<AuthResponse>;
    },
  });

  // save token & user to store after successful authentication
  useEffect(() => {
    if (query.isSuccess && !isEmpty(query.data)) {
      setAuth({
        access: query.data.access,
        authenticatedUser: query.data.authenticatedUser,
      });
    }
  }, [query.isSuccess, query.data]);

  return {
    ...query,
    isAuthenticated: !query.error && query.data?.success === true,
  };
}

export { useAuthentication };

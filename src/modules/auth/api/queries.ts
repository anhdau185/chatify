import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';

import { endpoint } from '@shared/lib/utils';
import type { GeneralApiError } from '@shared/types';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from '../types';

function useAuthentication() {
  const setAuth = useAuthStore(state => state.setAuth);
  const removeAuth = useAuthStore(state => state.removeAuth);

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
    gcTime: 0, // disables caching for this query
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

  // delete token & user (if any) from store upon unsuccessful authentication
  useEffect(() => {
    if (query.isError) removeAuth();
  }, [query.isError]);

  return query;
}

export { useAuthentication };

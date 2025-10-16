import { useQuery } from '@tanstack/react-query';

import { endpoint } from '@shared/lib/utils';
import type { GeneralApiError } from '@shared/types';
import type { AuthResponse } from '../types';

const useAuthentication = () => {
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

  return {
    ...query,
    isAuthenticated: !query.error && query.data?.success === true,
  };
};

export { useAuthentication };

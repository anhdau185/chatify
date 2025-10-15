import { useQuery } from '@tanstack/react-query';

import { AuthResponse, GeneralApiError } from '../types';

export const useAuthentication = () => {
  const query = useQuery({
    queryKey: ['auth/me'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8080/auth/me', {
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

// export const useLogout = () =>
//   useQuery({
//     queryKey: ['auth/logout'],
//     queryFn: async () => {
//       const res = await fetch('http://localhost:8080/auth/logout', {
//         credentials: 'include',
//       });

//       if (!res.ok) {
//         const { error: errorMsg } =
//           await (res.json() as Promise<GeneralApiError>);
//         throw new Error(errorMsg || 'Something went wrong on our end :(');
//       }

//       return res.json() as Promise<AuthResponse>;
//     },
//   });

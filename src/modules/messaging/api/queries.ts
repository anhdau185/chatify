import { useQuery } from '@tanstack/react-query';

import { endpoint } from '@shared/lib/utils';
import type { GeneralApiError } from '@shared/types';
import type { ChatRoomsResponse } from '../types';

function useChatRooms(userId: number) {
  return useQuery({
    queryKey: ['messaging/rooms', userId],
    queryFn: async () => {
      const res = await fetch(
        endpoint('/messaging/rooms', {
          queryParams: { userId: userId.toString() },
        }),
        {
          credentials: 'include', // include jwt cookie for checking identity
        },
      );

      if (!res.ok) {
        const { error: errorMsg } =
          await (res.json() as Promise<GeneralApiError>);
        throw new Error(errorMsg || 'Something went wrong on our end :(');
      }

      return res.json() as Promise<ChatRoomsResponse>;
    },
    staleTime: Infinity, // never refetch for this userId
  });
}

export { useChatRooms };

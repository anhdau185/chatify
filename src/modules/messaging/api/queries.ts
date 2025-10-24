import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { endpoint } from '@shared/lib/utils';
import type { GeneralApiError } from '@shared/types';
import { useChatStore } from '../store/chatStore';
import type { ChatRoomsResponse } from '../types';

// Fetches chat rooms for the given userId and syncs with chat store
// Then we only use the chat store to read/render the rooms elsewhere (e.g., ChatSidebar)
// We do not directly read data from this query elsewhere
function useChatRoomsQuery(userId: number) {
  const query = useQuery({
    queryKey: ['messaging/rooms', userId],
    queryFn: async () => {
      const res = await fetch(
        endpoint('/messaging/rooms', {
          queryParams: { userId: userId.toString() },
        }),
        { credentials: 'include' },
      );

      if (!res.ok) {
        const { error: errorMsg } =
          await (res.json() as Promise<GeneralApiError>);
        throw new Error(errorMsg || 'Something went wrong on our end :(');
      }

      return res.json() as Promise<ChatRoomsResponse>;
    },
    staleTime: Infinity, // never refetch for this userId
    enabled: false, // disable automatic query on mount
  });

  const resData = query.data;
  const setRooms = useChatStore(state => state.setRooms);

  useEffect(() => {
    if (resData) {
      const serverChatRooms = resData.data || [];
      setRooms(serverChatRooms);
    }
  }, [resData]);

  return {
    ...query,
    isInProgress: query.isFetching || !resData,
  };
}

// Imperatively fetch chat rooms for the given userId
function useFetchChatRoomsFn() {
  const queryClient = useQueryClient();

  return ({ userId }: { userId: number }) =>
    queryClient.fetchQuery({
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

export { useChatRoomsQuery, useFetchChatRoomsFn };

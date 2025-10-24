import { useEffect, type ReactNode } from 'react';

import { useAuthStore } from '@/modules/auth';
import * as wsClient from '../socket';
import { useChatStore } from '../store/chatStore';

export default function WebSocketWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const userId = useAuthStore(state => state.authenticatedUser!.id);
  const addMessage = useChatStore(state => state.addMessage);
  const activeRoomId = useChatStore(state => state.activeRoomId);

  useEffect(() => {
    wsClient.connect(msg => {
      console.log('received a message:', msg);
      addMessage(msg);
    });

    // TODO: handle disconnect on unmount?
  }, []);

  useEffect(() => {
    if (activeRoomId && wsClient.isOpen()) {
      wsClient.join({
        senderId: userId,
        roomId: activeRoomId,
      });
    }
  }, [activeRoomId, userId]);

  return <>{children}</>;
}

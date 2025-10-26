import { useEffect, useRef, type ReactNode } from 'react';

import { useAuthStore } from '@/modules/auth';
import * as db from '../db';
import * as wsClient from '../socket';
import { useChatStore } from '../store/chatStore';

export default function WebSocketWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const joinedRooms = useRef(new Set<string>());
  const userId = useAuthStore(state => state.authenticatedUser!.id);
  const addMessage = useChatStore(state => state.addMessage);
  const activeRoomId = useChatStore(state => state.activeRoomId);

  useEffect(() => {
    wsClient.connect(msg => {
      console.log('received a message:', msg);
      addMessage(msg);
      db.upsertSingleMessage(msg);
    });

    return () => {
      wsClient.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      !activeRoomId ||
      joinedRooms.current.has(activeRoomId) ||
      !wsClient.isOpen()
    ) {
      return;
    }

    wsClient.join({
      senderId: userId,
      roomId: activeRoomId,
    });
    joinedRooms.current.add(activeRoomId);
  }, [activeRoomId, userId]);

  return <>{children}</>;
}

import { useEffect, useRef, type ReactNode } from 'react';

import { useAuthStore } from '@/modules/auth';
import { isEmpty } from 'lodash-es';
import * as db from '../db';
import * as wsClient from '../socket';
import { useChatRoomIds, useChatStore } from '../store/chatStore';

export default function WebSocketWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const alreadyJoinedFlag = useRef(false); // to prevent unnecessary re-joining rooms on every roomIds change
  const userId = useAuthStore(state => state.authenticatedUser!.id);
  const roomIds = useChatRoomIds();
  const addMessage = useChatStore(state => state.addMessage);

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
    if (isEmpty(roomIds) || alreadyJoinedFlag.current || !wsClient.isOpen()) {
      return;
    }

    alreadyJoinedFlag.current = true;
    wsClient.join({
      roomIds,
      senderId: userId,
    });
  }, [roomIds, userId]);

  return <>{children}</>;
}

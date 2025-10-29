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
  const updateMessage = useChatStore(state => state.updateMessage);

  useEffect(() => {
    wsClient.connect(msg => {
      console.log('Received a message:', msg);

      switch (msg.type) {
        case 'chat':
          addMessage(msg.payload);
          break;
        case 'react':
          updateMessage(msg.payload.roomId, msg.payload.id, {
            reactions: msg.payload.reactions,
          });
          break;
        default:
          console.warn('Received message is of unknown type:', msg);
      }

      // Lastly, update new payload to db
      db.upsertSingleMessage(msg.payload);
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

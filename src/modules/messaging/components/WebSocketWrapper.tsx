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
  const userId = useAuthStore(state => state.authenticatedUser!.id); // userId is always non-nullable at this stage
  const roomIds = useChatRoomIds();
  const addMessage = useChatStore(state => state.addMessage);
  const updateMessage = useChatStore(state => state.updateMessage);

  useEffect(() => {
    wsClient.connect(msg => {
      console.log('Received a message:', msg);

      switch (msg.type) {
        case 'chat':
          addMessage(msg.payload);
          db.upsertSingleMessage(msg.payload);
          break;

        case 'react':
          updateMessage(msg.payload.roomId, msg.payload.id, {
            reactions: msg.payload.reactions,
          });
          db.patchMessage(msg.payload.id, {
            reactions: msg.payload.reactions,
          });
          break;

        default:
          console.warn('Received message is of unknown type:', msg);
      }
    });

    return () => {
      wsClient.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isEmpty(roomIds) || alreadyJoinedFlag.current) {
      return;
    }

    wsClient
      .join({ roomIds, senderId: userId })
      .then(() => {
        alreadyJoinedFlag.current = true;
      })
      .catch(err => {
        console.error('Failed to join rooms via WebSocket:', err);
        alreadyJoinedFlag.current = false;
      });
  }, [roomIds, userId]);

  return <>{children}</>;
}

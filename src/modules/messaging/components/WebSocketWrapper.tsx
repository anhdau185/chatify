import { useEffect, useRef, type ReactNode } from 'react';

import { useAuthStore } from '@/modules/auth';
import { isEmpty } from 'lodash-es';
import * as db from '../db';
import { buildReactions, getMessage } from '../lib/utils';
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
    wsClient.connect(wsMessage => {
      console.log('Received a message:', wsMessage);

      switch (wsMessage.type) {
        case 'chat': {
          addMessage(wsMessage.payload);
          db.upsertSingleMessage(wsMessage.payload);
          break;
        }

        case 'react': {
          const message = getMessage(
            wsMessage.payload.roomId,
            wsMessage.payload.id,
          );

          if (!message) break;

          const rebuiltReactions = buildReactions(
            wsMessage.payload.emoji,
            message.reactions,
            wsMessage.payload.reactor,
          );

          updateMessage(wsMessage.payload.roomId, wsMessage.payload.id, {
            reactions: rebuiltReactions,
          });
          db.patchMessage(wsMessage.payload.id, {
            reactions: rebuiltReactions,
          });
          break;
        }

        default: {
          console.warn('Received message is of unknown type:', wsMessage);
          break;
        }
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

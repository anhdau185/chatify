import { isEmpty } from 'lodash-es';
import { useEffect, useRef, type ReactNode } from 'react';

import { useAuthStore } from '@/modules/auth';
import { deferSideEffect, delay } from '@shared/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import * as db from '../db';
import * as messageQueueProcessor from '../lib/messageQueueProcessor';
import { buildReactions, getMessage } from '../lib/utils';
import * as wsClient from '../socket';
import { useChatRoomIds, useChatStore } from '../store/chatStore';
import {
  useCanSendNow,
  useConnectivityStore,
} from '../store/connectivityStore';
import { useMessageQueueStore } from '../store/messageQueueStore';
import { ChatMessage, WsMessageUpdateStatus } from '../types';

export default function ConnectivityWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const hasLostConnectionTimes = useRef(0);
  const hasOpenedSocketTimes = useRef(0);
  const alreadyJoinedFlag = useRef(false); // to prevent unnecessary re-joining rooms on every roomIds change

  const userId = useAuthStore(state => state.authenticatedUser!.id); // userId is always non-nullable at this stage
  const roomIds = useChatRoomIds();
  const addMessage = useChatStore(state => state.addMessage);
  const updateMessage = useChatStore(state => state.updateMessage);
  const enqueue = useMessageQueueStore(state => state.enqueue);
  const setOnline = useConnectivityStore(state => state.setOnline);
  const isOnline = useConnectivityStore(state => state.isOnline);
  const socketOpen = useConnectivityStore(state => state.socketOpen);
  const canSendNow = useCanSendNow();

  const showConnectionLostToast = (
    message: string,
    severity: 'warning' | 'error',
  ) => {
    toast.dismiss();
    deferSideEffect(() => {
      toast[severity](message, {
        duration: Infinity,
        closeButton: true,
        icon: <WifiOff className="h-4 w-4" />,
      });
    });
  };

  const showConnectionRestoredToast = (message: string) => {
    toast.dismiss();
    deferSideEffect(() => {
      toast.success(message, {
        icon: <Wifi className="h-4 w-4" />,
      });
    });
  };

  useEffect(() => {
    // Attach event listeners to watch for window online/offline events

    const handleOnline = () => {
      // On back online: mark online status in connectivity store as online
      setOnline(true);
    };

    const handleOffline = () => {
      // On connectivity lost - went offline:
      // Stop queue processing immediately and mark online status in connectivity store as offline
      messageQueueProcessor.stop();
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // On component did mount: establish WebSocket connection

    wsClient.connect(wsMessage => {
      console.log('Received a message:', wsMessage); // eslint-disable-line no-console

      switch (wsMessage.type) {
        case 'chat': {
          // Update status to "delivered" when a message arrives
          const deliveredMessage: ChatMessage = {
            ...wsMessage.payload,
            status: 'delivered',
          };
          addMessage(deliveredMessage);
          db.upsertSingleMessage(deliveredMessage);

          // Send acknowledgment back to server
          const deliveryAckMsg: WsMessageUpdateStatus = {
            type: 'update-status',
            payload: {
              id: deliveredMessage.id,
              roomId: deliveredMessage.roomId,
              senderId: deliveredMessage.senderId,
              createdAt: deliveredMessage.createdAt,
              status: 'delivered',
            },
          };
          enqueue(deliveryAckMsg);
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

        case 'update-status': {
          switch (wsMessage.payload.status) {
            case 'sent': {
              updateMessage(wsMessage.payload.roomId, wsMessage.payload.id, {
                status: wsMessage.payload.status,
              });
              db.patchMessage(wsMessage.payload.id, {
                status: wsMessage.payload.status,
              });
              break;
            }

            case 'retry-successful': {
              updateMessage(
                wsMessage.payload.roomId,
                wsMessage.payload.id,
                {
                  status: wsMessage.payload.status,
                  createdAt: wsMessage.payload.createdAt,
                },
                true,
              );
              db.patchMessage(wsMessage.payload.id, {
                status: wsMessage.payload.status,
                createdAt: wsMessage.payload.createdAt,
              });
              break;
            }

            case 'delivered': {
              updateMessage(wsMessage.payload.roomId, wsMessage.payload.id, {
                status: wsMessage.payload.status,
              });
              db.patchMessage(wsMessage.payload.id, {
                status: wsMessage.payload.status,
              });
              break;
            }

            default: {
              break;
            }
          }
          break;
        }

        default: {
          console.warn('Received message is of unknown type:', wsMessage); // eslint-disable-line no-console
          break;
        }
      }
    });

    return () => {
      wsClient.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canSendNow || isEmpty(roomIds) || alreadyJoinedFlag.current) {
      return;
    }

    // When connectivity's available/restored, join/rejoin rooms, then lastly start queue processing
    wsClient
      .join({ roomIds, senderId: userId })
      .then(() => {
        alreadyJoinedFlag.current = true;
        return delay(200); // small jitter after joining before starting queue
      })
      .then(() => messageQueueProcessor.start())
      .catch(err => {
        alreadyJoinedFlag.current = false;
        // eslint-disable-next-line no-console
        console.error(
          'Failed to join rooms via WebSocket or to start message queue:',
          err,
        );
      });
  }, [canSendNow, roomIds, userId]);

  useEffect(() => {
    if (!canSendNow) {
      // When connectivity's lost, just turn alreadyJoinedFlag off to allow rejoining when connectivity's restored
      alreadyJoinedFlag.current = false;
    }
  }, [canSendNow]);

  // Effect to show feedback when going offline
  useEffect(() => {
    if (!isOnline) {
      hasLostConnectionTimes.current += 1;
      showConnectionLostToast(
        "You're offline. Messages will send when back online.",
        'error',
      );
    }
  }, [isOnline]);

  // Effect to show feedback when going back online
  useEffect(() => {
    if (isOnline && hasLostConnectionTimes.current >= 1) {
      // Back online from offline state earlier, so notify user
      showConnectionRestoredToast('Back online.');
    }
  }, [isOnline]);

  // Effect to show feedback when socket is restored
  useEffect(() => {
    if (socketOpen) {
      hasOpenedSocketTimes.current += 1;

      if (hasOpenedSocketTimes.current >= 2) {
        // Socket restored from a disconnection earlier, not the initially established connection, so notify user
        showConnectionRestoredToast('Connected to server.');
      }
    }
  }, [socketOpen]);

  // Effect to show feedback when socket is closed
  useEffect(() => {
    if (!socketOpen && hasOpenedSocketTimes.current >= 1) {
      // Socket connection closed, not the initial state of "not yet established", so notify user
      showConnectionLostToast(
        "Not connected to server. Messages will send when connection's restored.",
        'warning',
      );
    }
  }, [socketOpen]);

  return <>{children}</>;
}

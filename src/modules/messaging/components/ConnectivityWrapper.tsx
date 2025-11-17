import { isEmpty } from 'lodash-es';
import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';

import { useAuthStore } from '@/modules/auth';
import { deferPostPaint, delay } from '@shared/lib/utils';
import * as db from '../db';
import * as messageQueueProcessor from '../lib/messageQueueProcessor';
import { buildReactions, getMessage } from '../lib/utils';
import * as wsClient from '../socket';
import { useChatRoomIds, useChatStore } from '../store/chatStore';
import { useConnectivityStore } from '../store/connectivityStore';
import { useMessageQueueStore } from '../store/messageQueueStore';
import { ChatMessage, WsMessageUpdateStatus } from '../types';

const connectivityLostToast = (
  message: string,
  severity: 'warning' | 'error',
) => {
  toast.dismiss();
  deferPostPaint(() => {
    toast[severity](message, {
      duration: Infinity,
      closeButton: true,
      icon: <WifiOff className="h-4 w-4" />,
    });
  });
};

const connectivityRestoredToast = (message: string) => {
  toast.dismiss();
  deferPostPaint(() => {
    toast.success(message, {
      icon: <Wifi className="h-4 w-4" />,
    });
  });
};

export default function ConnectivityWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const hasGoneOfflineTimes = useRef(0);
  const hasOpenedSocketTimes = useRef(0);
  const hasAlreadyJoinedRooms = useRef(false); // for preventing unnecessarily re-joining rooms every time roomIds changes

  const userId = useAuthStore(state => state.authenticatedUser!.id); // userId is always non-nullable at this stage
  const roomIds = useChatRoomIds();
  const addMessage = useChatStore(state => state.addMessage);
  const updateMessage = useChatStore(state => state.updateMessage);
  const enqueue = useMessageQueueStore(state => state.enqueue);
  const setOutboxReady = useMessageQueueStore(state => state.setOutboxReady);

  const setOnline = useConnectivityStore(state => state.setOnline);
  const isOnline = useConnectivityStore(state => state.isOnline);
  const socketOpen = useConnectivityStore(state => state.socketOpen);
  const canSendNow = isOnline && socketOpen;

  useEffect(() => {
    // On component did mount: Attach event listeners to watch for window online/offline events

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
      // On component will unmount: Detach event listeners
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // On component did mount: Establish WebSocket connection

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
          window.requestIdleCallback(() => {
            db.upsertSingleMessage(deliveredMessage);
          });

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
          window.requestIdleCallback(() => {
            db.patchMessage(wsMessage.payload.id, {
              reactions: rebuiltReactions,
            });
          });
          break;
        }

        case 'update-status': {
          switch (wsMessage.payload.status) {
            case 'sent': {
              updateMessage(wsMessage.payload.roomId, wsMessage.payload.id, {
                status: wsMessage.payload.status,
              });
              window.requestIdleCallback(() => {
                db.patchMessage(wsMessage.payload.id, {
                  status: wsMessage.payload.status,
                });
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
              window.requestIdleCallback(() => {
                db.patchMessage(wsMessage.payload.id, {
                  status: wsMessage.payload.status,
                  createdAt: wsMessage.payload.createdAt,
                });
              });
              break;
            }

            case 'delivered': {
              updateMessage(wsMessage.payload.roomId, wsMessage.payload.id, {
                status: wsMessage.payload.status,
              });
              window.requestIdleCallback(() => {
                db.patchMessage(wsMessage.payload.id, {
                  status: wsMessage.payload.status,
                });
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
      // On component will unmount: Close WebSocket connection
      wsClient.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canSendNow || isEmpty(roomIds) || hasAlreadyJoinedRooms.current) {
      return;
    }

    // When connectivity's available/restored, join/rejoin rooms, then lastly start queue processing
    wsClient
      .join({ roomIds, senderId: userId })
      .then(() => {
        hasAlreadyJoinedRooms.current = true;
        return delay(300); // small delay after joining before starting queue
      })
      .then(() => messageQueueProcessor.start())
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('Successfully joined rooms and started queue processing');
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to join rooms via WebSocket or to start message queue:',
          err,
        );
        hasAlreadyJoinedRooms.current = false;
      })
      .finally(() => {
        setOutboxReady(true);
      });
  }, [canSendNow, roomIds, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canSendNow) {
      // When connectivity's lost, just turn alreadyJoinedFlag off to allow rejoining when connectivity's restored
      hasAlreadyJoinedRooms.current = false;
    }
  }, [canSendNow]);

  // Effect to show feedback when going offline
  useEffect(() => {
    if (!isOnline) {
      hasGoneOfflineTimes.current += 1;
      connectivityLostToast(
        "You're offline. Messages will be sent when back online.",
        'error',
      );
    }
  }, [isOnline]);

  // Effect to show feedback when going back online
  useEffect(() => {
    if (isOnline && hasGoneOfflineTimes.current >= 1) {
      // Back online from offline state earlier, so notify user
      connectivityRestoredToast('Back online.');
    }
  }, [isOnline]);

  // Effect to show feedback when socket is restored
  useEffect(() => {
    if (socketOpen) {
      hasOpenedSocketTimes.current += 1;

      if (hasOpenedSocketTimes.current >= 2) {
        // Socket restored from a disconnection earlier, not the initially established connection, so notify user
        connectivityRestoredToast('Connected to server.');
      }
    }
  }, [socketOpen]);

  // Effect to show feedback when socket is closed
  useEffect(() => {
    if (!socketOpen && hasOpenedSocketTimes.current >= 1) {
      // Socket connection closed, not the initial state of "not yet established", so notify user
      connectivityLostToast(
        "Not connected to server. Messages will be sent when connection's restored.",
        'error',
      );
    }
  }, [socketOpen]);

  return <>{children}</>;
}

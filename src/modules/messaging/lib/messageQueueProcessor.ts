import { toast } from 'sonner';

import * as db from '../db';
import * as wsClient from '../socket';
import { useChatStore } from '../store/chatStore';
import { useMessageQueueStore } from '../store/messageQueueStore';
import type { WsMessageComms } from '../types';
import { buildReactions, getMessage } from './utils';

type MessageProcessor = {
  intervalId: number | null;
  retryCount: Map<string, number>;
  isProcessing: boolean;
};

const PROCESSOR_CONFIG = {
  INTERVAL_MS: 3000, // how often to check queue
  MAX_RETRIES: 3, // maximum retry attempts per message
  BATCH_SIZE: 5, // max messages to process per interval
  RETRY_DELAY_MS: 1000, // delay between retries
} as const;

// Processor state management
const processor: MessageProcessor = {
  intervalId: null,
  retryCount: new Map(),
  isProcessing: false,
};

// Main processor logic
async function processMessageQueue() {
  if (processor.isProcessing || !wsClient.isOpen()) {
    return;
  }

  processor.isProcessing = true;

  try {
    let processedCount = 0;

    while (processedCount < PROCESSOR_CONFIG.BATCH_SIZE) {
      const originalWsMessage = useMessageQueueStore.getState().dequeue();

      if (!originalWsMessage) {
        break; // queue is empty
      }

      const wsMessageToSend = originalWsMessage;
      const retryTrackingKey = `${wsMessageToSend.payload.id}--${wsMessageToSend.type}`;

      if (
        wsMessageToSend.type === 'chat' &&
        wsMessageToSend.payload.status === 'pending'
      ) {
        // For "chat" message only: Update status to "sending" before sending
        wsMessageToSend.payload.status = 'sending';
      }

      try {
        await trySendingMsgOverWebSocket(wsMessageToSend);

        // On success:
        // 1. Increment the processed count in the current batch
        processedCount++;

        // 2. Remove from retry tracking if it's there
        processor.retryCount.delete(retryTrackingKey);

        if (wsMessageToSend.type === 'chat') {
          // 3. For "chat" message only: Update status to "sending" (UI and DB)
          useChatStore
            .getState()
            .updateMessage(
              wsMessageToSend.payload.roomId,
              wsMessageToSend.payload.id,
              { status: 'sending' },
            );
          db.patchMessage(wsMessageToSend.payload.id, { status: 'sending' });
        }
      } catch (error) {
        const currentRetries = processor.retryCount.get(retryTrackingKey) || 0;

        if (currentRetries < PROCESSOR_CONFIG.MAX_RETRIES) {
          // Re-enqueue original WS message with incremented retry count
          processor.retryCount.set(retryTrackingKey, currentRetries + 1);
          useMessageQueueStore.getState().enqueue(originalWsMessage);

          // Add exponential backoff delay
          await new Promise<void>(resolve => {
            window.setTimeout(
              resolve,
              PROCESSOR_CONFIG.RETRY_DELAY_MS * Math.pow(2, currentRetries),
            );
          });
        } else {
          // On max retries reached:
          // 1. Increment the processed count in the current batch
          processedCount++;

          // 2. Remove from retry tracking
          processor.retryCount.delete(retryTrackingKey);

          // 3. Further failure handling based on message type
          switch (wsMessageToSend.type) {
            case 'chat': {
              // For "chat" message: Update status to "failed" (UI and DB)
              useChatStore
                .getState()
                .updateMessage(
                  wsMessageToSend.payload.roomId,
                  wsMessageToSend.payload.id,
                  { status: 'failed' },
                );
              db.patchMessage(wsMessageToSend.payload.id, { status: 'failed' });
              break;
            }

            case 'react': {
              // For "react" message:
              // 1. Notify user of failure
              toast.error('Failed to send reaction. Please try again.');

              // 2. Revert the optimistic reaction update earlier (UI and DB)
              const message = getMessage(
                wsMessageToSend.payload.roomId,
                wsMessageToSend.payload.id,
              );

              if (!message) break;

              const revertedReactions = buildReactions(
                wsMessageToSend.payload.emoji,
                message.reactions,
                wsMessageToSend.payload.reactor,
              );

              useChatStore
                .getState()
                .updateMessage(
                  wsMessageToSend.payload.roomId,
                  wsMessageToSend.payload.id,
                  { reactions: revertedReactions },
                );
              db.patchMessage(wsMessageToSend.payload.id, {
                reactions: revertedReactions,
              });
              break;
            }

            default: {
              break;
            }
          }
        }
      }
    }
  } finally {
    processor.isProcessing = false;
  }
}

async function start() {
  if (processor.intervalId) {
    return; // already running
  }

  const initialQueue = await db.getQueue();
  if (initialQueue.length > 0) {
    useMessageQueueStore.getState().setQueue(initialQueue);
  }

  // Initial immediate process
  processMessageQueue();

  // Set up interval for subsequent processing
  processor.intervalId = window.setInterval(
    processMessageQueue,
    PROCESSOR_CONFIG.INTERVAL_MS,
  );
}

function stop() {
  if (processor.intervalId) {
    window.clearInterval(processor.intervalId);
    processor.intervalId = null;
  }
  processor.retryCount.clear();
  processor.isProcessing = false;
}

// Helper function to send the actual message
async function trySendingMsgOverWebSocket(wsMessage: WsMessageComms) {
  return new Promise<void>((resolve, reject) => {
    try {
      if (!wsClient.isOpen()) {
        throw new Error('WebSocket connection is not open');
      }

      wsClient.dispatch(wsMessage);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export { start, stop };

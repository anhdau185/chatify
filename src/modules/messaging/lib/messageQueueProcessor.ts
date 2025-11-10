import { cloneDeep } from 'lodash-es';
import { toast } from 'sonner';

import { delay } from '@shared/lib/utils';
import * as db from '../db';
import * as wsClient from '../socket';
import { useChatStore } from '../store/chatStore';
import {
  selectCanSendNow,
  useConnectivityStore,
} from '../store/connectivityStore';
import { useMessageQueueStore } from '../store/messageQueueStore';
import type { WsMessageComms } from '../types';
import { buildReactions, getMessage } from './utils';

type MessageProcessor = {
  nextBatchTimeout: number | null;
  isProcessing: boolean;
  hasAlreadyHydratedQueue: boolean;
  retryCount: Map<string, number>;
};

enum ProcessorConfig {
  BATCH_SIZE = 5, // max messages to process per interval
  MAX_RETRIES = 3, // maximum retry attempts per message
  RETRY_DELAY_MS = 1000, // delay between retries
}

// Processor state management
const processor: MessageProcessor = {
  nextBatchTimeout: null,
  isProcessing: false,
  hasAlreadyHydratedQueue: false,
  retryCount: new Map<string, number>(),
};

// Main processor logic
async function processBatch() {
  if (
    processor.isProcessing ||
    !selectCanSendNow(useConnectivityStore.getState())
  ) {
    return;
  }

  processor.isProcessing = true;

  try {
    let processedCount = 0;

    while (processedCount < ProcessorConfig.BATCH_SIZE) {
      if (!selectCanSendNow(useConnectivityStore.getState())) {
        break; // connectivity lost mid-batch
      }

      const originalWsMessage = useMessageQueueStore.getState().dequeue();
      if (!originalWsMessage) {
        break; // queue is empty
      }

      const wsMessageToSend = cloneDeep(originalWsMessage);
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

        if (
          wsMessageToSend.type === 'chat' &&
          wsMessageToSend.payload.status === 'sending'
        ) {
          // 3. For "chat" message only: Update status to "sending" (if not "retrying")
          useChatStore
            .getState()
            .updateMessage(
              wsMessageToSend.payload.roomId,
              wsMessageToSend.payload.id,
              { status: 'sending' },
            );
          window.requestIdleCallback(() => {
            db.patchMessage(wsMessageToSend.payload.id, { status: 'sending' });
          });
        }
      } catch (error) {
        const currentRetries = processor.retryCount.get(retryTrackingKey) || 0;

        if (currentRetries < ProcessorConfig.MAX_RETRIES) {
          // Increment retry count for this item
          processor.retryCount.set(retryTrackingKey, currentRetries + 1);

          // Re-enqueue item at the head so it's retried immediately next iteration (preserve original order)
          useMessageQueueStore.getState().enqueueFront(originalWsMessage);

          // Exponential backoff delay (pause this run) before starting next attempt to avoid retrying too quickly
          await delay(ProcessorConfig.RETRY_DELAY_MS * 2 ** currentRetries);
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
              window.requestIdleCallback(() => {
                db.patchMessage(wsMessageToSend.payload.id, {
                  status: 'failed',
                });
              });
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
              window.requestIdleCallback(() => {
                db.patchMessage(wsMessageToSend.payload.id, {
                  reactions: revertedReactions,
                });
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
    // Current batch completed
    processor.isProcessing = false;

    // Decide whether to schedule the next batch and when to run it
    const queueItemsLeft = useMessageQueueStore.getState().queue.size;
    if (
      queueItemsLeft > 0 &&
      selectCanSendNow(useConnectivityStore.getState())
    ) {
      scheduleBatch(computeNextBatchDelay(queueItemsLeft));
    }
  }
}

/**
 * Helper function to send the actual message
 */
async function trySendingMsgOverWebSocket(wsMessage: WsMessageComms) {
  return new Promise<void>((resolve, reject) => {
    try {
      if (!selectCanSendNow(useConnectivityStore.getState())) {
        throw new Error('WebSocket connection is not open');
      }

      wsClient.dispatch(wsMessage);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Pure function to compute delay in ms before the next batch runs.
 * Queue-size tiers drive base delay; optional last batch duration in ms
 * can slightly adjust pacing (ignored if not provided).
 */
function computeNextBatchDelay(
  queueSize: number,
  lastBatchDurationMs?: number,
): number {
  // Base delay by backlog size
  let base =
    queueSize >= 200
      ? 75
      : queueSize >= 100
        ? 125
        : queueSize >= 50
          ? 200
          : queueSize >= 10
            ? 350
            : 500;

  // Optional tweak based on last batch duration
  if (typeof lastBatchDurationMs === 'number') {
    if (lastBatchDurationMs > 900) {
      base += 150; // heavy batch: slow down a bit
    } else if (lastBatchDurationMs < 200) {
      base -= 75; // quick batch: speed up a bit
    }
  }

  // Clamp to safe bounds
  if (base < 50) {
    base = 50;
  } else if (base > 800) {
    base = 800;
  }

  return base;
}

/**
 * Schedules next batch processing with an optional delay.
 */
function scheduleBatch(delayMs = 0) {
  if (processor.isProcessing || processor.nextBatchTimeout != null) {
    return;
  }

  processor.nextBatchTimeout = window.setTimeout(() => {
    processor.nextBatchTimeout = null;
    void processBatch();
  }, delayMs);
}

/**
 * Auto wake-up: if the queue transitions from empty -> non-empty while we are
 * allowed to send and the processor is idle (no batch scheduled), schedule an
 * immediate batch. This removes the need for external callers to remember to
 * invoke start() after enqueue operations.
 *
 * We purposefully only react to 'size == 0' -> 'size > 0' transition to avoid redundant
 * scheduling on subsequent enqueues while a batch or timeout is already in
 * flight. Strict ordering is preserved because we still process sequentially.
 */
void useMessageQueueStore.subscribe(
  state => state.queue.size,
  (size, prevSize) => {
    if (
      prevSize === 0 &&
      size > 0 &&
      !processor.isProcessing &&
      processor.nextBatchTimeout == null &&
      selectCanSendNow(useConnectivityStore.getState())
    ) {
      scheduleBatch(0);
    }
  },
);

// Public APIs

/**
 * Starts / resumes the queue processing.
 * Asynchronously hydrates the queue from DB beforehand if needed.
 */
async function start() {
  if (processor.isProcessing || processor.nextBatchTimeout != null) {
    return;
  }

  if (useMessageQueueStore.getState().queue.size > 0) {
    // Queue has items, start processing ASAP
    scheduleBatch(0);
    return;
  }

  // Queue is empty here, check if we need to hydrate from DB
  if (!processor.hasAlreadyHydratedQueue) {
    // Runs only once: Queue not yet hydrated, get persisted queue from DB and set into store
    processor.hasAlreadyHydratedQueue = true;
    const initialQueue = await db.getQueue();

    if (initialQueue.length > 0) {
      // There are persisted items so we'll rely on the queue-size subscription to auto-schedule a batch
      useMessageQueueStore.getState().setQueue(initialQueue);
    }
  }
}

/**
 * Pauses the queue processing and cancels any scheduled future batch.
 * Keeps `processor.retryCount` tracking by default to preserve backoff state.
 */
function stop(resetRetries = false) {
  if (processor.nextBatchTimeout != null) {
    window.clearTimeout(processor.nextBatchTimeout);
    processor.nextBatchTimeout = null;
  }

  if (resetRetries) processor.retryCount.clear();
  processor.isProcessing = false;
}

export { start, stop };

import { List as Queue } from 'immutable';
import { debounce } from 'lodash-es';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import * as db from '../db';
import type { WsMessageComms } from '../types';

type MessageQueueState = {
  queue: Queue<WsMessageComms>;
};

type MessageQueueAction = {
  setQueue: (wsMessages: WsMessageComms[]) => void;
  enqueue: (wsMessage: WsMessageComms) => void;
  enqueueFront: (wsMessage: WsMessageComms) => void;
  dequeue: () => WsMessageComms | null;
};

const useMessageQueueStore = create<MessageQueueState & MessageQueueAction>()(
  subscribeWithSelector(set => ({
    queue: Queue(),

    setQueue(wsMessages) {
      set({ queue: Queue(wsMessages) });
    },

    enqueue(wsMessage) {
      set(state => ({
        queue: state.queue.push(wsMessage),
      }));
    },

    enqueueFront(wsMessage) {
      set(state => ({
        queue: state.queue.unshift(wsMessage),
      }));
    },

    dequeue() {
      let dequeued: WsMessageComms | null = null;

      set(state => {
        if (state.queue.size === 0) {
          return state;
        }

        dequeued = state.queue.first() ?? null;
        return { queue: state.queue.shift() };
      });

      return dequeued;
    },
  })),
);

const persistQueueDebounced = debounce((queueItems: WsMessageComms[]) => {
  window.requestIdleCallback(() => {
    db.replaceQueue(queueItems);
  });
}, 1000);

useMessageQueueStore.subscribe(
  state => state.queue,
  queue => {
    persistQueueDebounced(queue.toArray());
  },
);

export { useMessageQueueStore };

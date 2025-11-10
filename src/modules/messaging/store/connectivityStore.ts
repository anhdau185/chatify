import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type ConnectivityState = {
  isOnline: boolean; // from window online/offline
  socketOpen: boolean; // from websocket lifecycle
  lastChangeAt: number;
};

export type ConnectivityActions = {
  setOnline: (online: boolean) => void;
  setSocketOpen: (open: boolean) => void;
};

const useConnectivityStore = create<ConnectivityState & ConnectivityActions>()(
  subscribeWithSelector(set => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    socketOpen: false,
    lastChangeAt: Date.now(),

    setOnline(online: boolean) {
      set(state => {
        if (state.isOnline === online) {
          return state;
        }
        return {
          isOnline: online,
          lastChangeAt: Date.now(),
        };
      });
    },

    setSocketOpen(open: boolean) {
      set(state => {
        if (state.socketOpen === open) {
          return state;
        }
        return {
          socketOpen: open,
          lastChangeAt: Date.now(),
        };
      });
    },
  })),
);

// Helper hook for components to easily check if messages can be sent now
export function useCanSendNow() {
  const isOnline = useConnectivityStore(state => state.isOnline);
  const socketOpen = useConnectivityStore(state => state.socketOpen);
  return isOnline && socketOpen;
}

// Selector for non-hook usage outside components
export const selectCanSendNow = (state: ConnectivityState) =>
  state.isOnline && state.socketOpen;

export { useConnectivityStore };

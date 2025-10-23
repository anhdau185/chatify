import { create } from 'zustand';

import type { ChatRoom } from '../types';

export interface SelectedRoomState {
  selectedRoom: ChatRoom | null;
  setSelectedRoom: (room: ChatRoom) => void;
  resetSelectedRoom: () => void;
}

export const useSelectedRoomStore = create<SelectedRoomState>(set => ({
  selectedRoom: null,

  setSelectedRoom(room) {
    set(state => ({ ...state, selectedRoom: room }));
  },

  resetSelectedRoom() {
    set(state => ({ ...state, selectedRoom: null }));
  },
}));

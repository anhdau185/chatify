import { create } from 'zustand';

import type { ChatMessage, ChatRoom } from '../types';

type ChatState = {
  rooms: Record<string, ChatRoom>; // roomId -> room
  messagesByRoom: Record<string, ChatMessage[]>; // roomId -> list messages
  activeRoomId: string | null;
};

type ChatActions = {
  setActiveRoomId: (roomId: string) => void;
  setRooms: (roomsArr: ChatRoom[]) => void;
  upsertRoom: (room: ChatRoom) => void;
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (
    roomId: string,
    msgId: string,
    patch: Partial<ChatMessage>,
  ) => void;
  removeMessage: (roomId: string, msgId: string) => void;
};

export const useChatStore = create<ChatState & ChatActions>(set => ({
  rooms: {},
  messagesByRoom: {},
  activeRoomId: null,

  setActiveRoomId(roomId) {
    set({ activeRoomId: roomId });
  },

  setRooms(roomsArr) {
    set(() => ({
      rooms: roomsArr.reduce((acc, room) => ({ ...acc, [room.id]: room }), {}),
    }));
  },

  upsertRoom(room) {
    set(state => ({
      rooms: { ...state.rooms, [room.id]: room },
    }));
  },

  addMessage(msg) {
    set(state => {
      const prev = state.messagesByRoom[msg.roomId] || [];
      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [msg.roomId]: [...prev, msg],
        },
      };
    });
  },

  updateMessage(roomId, msgId, patch) {
    set(state => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: state.messagesByRoom[roomId].map(m =>
          m.id === msgId ? { ...m, ...patch } : m,
        ),
      },
    }));
  },

  removeMessage(roomId, msgId) {
    set(state => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: state.messagesByRoom[roomId].filter(m => m.id !== msgId),
      },
    }));
  },
}));

export function useActiveRoom(): ChatRoom | null {
  const activeRoomId = useChatStore(state => state.activeRoomId);
  const rooms = useChatStore(state => state.rooms);

  if (!activeRoomId) {
    return null;
  }

  return rooms[activeRoomId];
}

export function useMessagesInActiveRoom(): ChatMessage[] {
  const activeRoomId = useChatStore(state => state.activeRoomId);
  const messagesByRoom = useChatStore(state => state.messagesByRoom);

  if (!activeRoomId) {
    return [];
  }

  // undefined messages in the active room is a possibility in reality
  // (eg. room has no messages yet)
  const messagesInActiveRoom = messagesByRoom[activeRoomId] as
    | ChatMessage[]
    | undefined;

  return messagesInActiveRoom ?? [];
}

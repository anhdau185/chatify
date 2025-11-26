import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import * as db from '../db';
import { getIsSelfChat } from '../lib/utils';
import type { ChatMessage, ChatRoom } from '../types';

type ChatState = {
  rooms: Record<string, ChatRoom>; // roomId -> room
  messagesByRoom: Record<string, ChatMessage[]>; // roomId -> list messages
  activeRoomId: string | null;
};

type ChatActions = {
  setActiveRoomId: (roomId: string | null) => void;
  setRooms: (roomsArr: ChatRoom[]) => void;
  upsertRoom: (room: ChatRoom) => void;
  replaceRoomMessages: (roomId: string, messages: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (
    roomId: string,
    msgId: string,
    patch: Partial<ChatMessage>,
    performSort?: boolean,
  ) => void;
  removeMessage: (roomId: string, msgId: string) => void;
};

const useChatStore = create<ChatState & ChatActions>()(
  subscribeWithSelector(set => ({
    rooms: {},
    messagesByRoom: {},
    activeRoomId: null,

    setActiveRoomId(roomId) {
      set({ activeRoomId: roomId });
    },

    setRooms(roomsArr) {
      set({
        rooms: roomsArr.reduce(
          (acc, room) => ({ ...acc, [room.id]: room }),
          {},
        ),
      });
    },

    upsertRoom(room) {
      set(state => ({
        rooms: { ...state.rooms, [room.id]: room },
      }));
    },

    replaceRoomMessages(roomId, messages) {
      set(state => ({
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: messages,
        },
      }));
    },

    addMessage(msg) {
      set(state => {
        const prevMsgs =
          (state.messagesByRoom[msg.roomId] as ChatMessage[] | undefined) ?? [];

        // TODO: Optimize performance of this sorting step
        const newMsgs = [...prevMsgs, msg].sort(
          (a, b) => a.createdAt - b.createdAt,
        );

        const room = (state.rooms[msg.roomId] as ChatRoom | undefined) ?? null;

        return {
          // append message to the list of messages in the corresponding room
          messagesByRoom: {
            ...state.messagesByRoom,
            [msg.roomId]: newMsgs,
          },
          // update lastMsg and lastMsgAt in the corresponding room (if exists)
          rooms: room
            ? {
                ...state.rooms,
                [msg.roomId]: {
                  ...room,
                  lastMsg: msg,
                  lastMsgAt: msg.createdAt,
                },
              }
            : state.rooms,
        };
      });
    },

    updateMessage(roomId, msgId, patch, performSort = false) {
      set(state => {
        const msgsInRoom = state.messagesByRoom[roomId] as
          | ChatMessage[]
          | undefined;

        if (!msgsInRoom || isEmpty(msgsInRoom)) {
          return state; // no messages in the room, nothing to update
        }

        const isMsgExistent = msgsInRoom.some(m => m.id === msgId);
        if (!isMsgExistent) {
          return state; // message with msgId not found in the room, nothing to update
        }

        const newMsgs = msgsInRoom.map(m =>
          m.id === msgId ? { ...m, ...patch } : m,
        );

        if (performSort) {
          // Optionally perform sort after update (useful when createdAt gets updated)
          // TODO: Optimize performance of this sorting step
          newMsgs.sort((a, b) => a.createdAt - b.createdAt);
        }

        return {
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: newMsgs,
          },
        };
      });
    },

    removeMessage(roomId, msgId) {
      set(state => ({
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: state.messagesByRoom[roomId].filter(m => m.id !== msgId),
        },
      }));
    },
  })),
);

function useRecentChatRooms(): ChatRoom[] {
  const roomsRecord = useChatStore(state => state.rooms);

  // memoize the expensive sorting so that it only re-calculates when roomsRecord changes
  const sorted = useMemo(() => {
    const rooms = Object.values(roomsRecord);
    rooms.sort((a, b) => b.lastMsgAt - a.lastMsgAt); // sort rooms by lastMsgAt DESC
    return rooms;
  }, [roomsRecord]);

  return sorted;
}

function useChatRoomIds(): string[] {
  const roomsRecord = useChatStore(state => state.rooms);
  return Object.keys(roomsRecord);
}

function useActiveRoom(): ChatRoom | null {
  const activeRoomId = useChatStore(state => state.activeRoomId);
  const roomsRecord = useChatStore(state => state.rooms);

  if (!activeRoomId) {
    return null;
  }

  const activeRoom = roomsRecord[activeRoomId] as ChatRoom | undefined;
  return activeRoom ?? null;
}

function useIsActiveRoomSelf(userId: number): boolean {
  const activeRoom = useActiveRoom();

  if (!activeRoom) {
    return false;
  }

  return getIsSelfChat(activeRoom, userId);
}

function useMessagesInActiveRoom(): ChatMessage[] {
  const activeRoomId = useChatStore(state => state.activeRoomId);
  const messagesByRoom = useChatStore(state => state.messagesByRoom);

  if (!activeRoomId) {
    return [];
  }

  // undefined messages in the active room is a possibility in reality (eg. room has no messages yet)
  const messagesInActiveRoom = messagesByRoom[activeRoomId] as
    | ChatMessage[]
    | undefined;

  return messagesInActiveRoom ?? [];
}

// subscribe to state.rooms changes and persist rooms to db whenever changes happen
useChatStore.subscribe(
  state => state.rooms,
  roomsRecord => {
    window.requestIdleCallback(() => {
      // turn roomsRecord { roomId -> ChatRoom } into a single array of rooms
      const rooms = Object.values(roomsRecord);
      db.replaceAllRooms(rooms);
    });
  },
);

export {
  useChatStore,
  useActiveRoom,
  useIsActiveRoomSelf,
  useMessagesInActiveRoom,
  useRecentChatRooms,
  useChatRoomIds,
};

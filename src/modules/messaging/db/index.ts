import Dexie, { type Table } from 'dexie';

import type { ChatMessage, ChatRoom } from '../types';

class ChatDB extends Dexie {
  rooms!: Table<ChatRoom>;
  messages!: Table<ChatMessage>;

  constructor() {
    super('chat_db');

    this.version(1).stores({
      // index by lastMsgAt for sorting recent rooms
      rooms: 'id, lastMsgAt, isGroup',
      // index by roomId and createdAt for chronological queries
      messages: 'id, roomId, senderId, createdAt',
    });
  }
}

const db = new ChatDB();

async function getRecentRooms(): Promise<ChatRoom[]> {
  try {
    return db.rooms.orderBy('lastMsgAt').reverse().toArray();
  } catch (err) {
    console.error('Failed to get recent rooms:', err);
    return [];
  }
}

async function getRoomMessages(roomId: string): Promise<ChatMessage[]> {
  try {
    return db.messages.where('roomId').equals(roomId).sortBy('createdAt');
  } catch (err) {
    console.error(`Failed to get messages for roomId=${roomId}:`, err);
    return [];
  }
}

// convenience function to replace all rooms and messages at once
async function replaceAll(rooms: ChatRoom[], messages: ChatMessage[]) {
  try {
    await db.transaction('rw', db.rooms, db.messages, async () => {
      await db.rooms.clear();
      await db.messages.clear();

      if (rooms.length) await db.rooms.bulkPut(rooms);
      if (messages.length) await db.messages.bulkPut(messages);
    });
  } catch (err) {
    console.error('Failed to replace all rooms and messages:', err);
  }
}

async function replaceAllRooms(rooms: ChatRoom[]) {
  try {
    await db.transaction('rw', db.rooms, async () => {
      await db.rooms.clear(); // clear old rooms
      await db.rooms.bulkAdd(rooms); // insert new ones
    });
  } catch (err) {
    console.error('Failed to replace all rooms:', err);
  }
}

async function replaceAllMessages(messages: ChatMessage[]) {
  try {
    await db.transaction('rw', db.messages, async () => {
      await db.messages.clear(); // clear old messages
      await db.messages.bulkAdd(messages); // insert new ones
    });
  } catch (err) {
    console.error(`Failed to replace all messages:`, err);
  }
}

async function replaceRoomMessages(roomId: string, messages: ChatMessage[]) {
  if (!roomId) return;

  try {
    await db.transaction('rw', db.messages, async () => {
      await db.messages.where('roomId').equals(roomId).delete(); // clear old messages for this room
      await db.messages.bulkPut(messages); // upsert new ones
    });
  } catch (err) {
    console.error(`Failed to replace messages with roomId=${roomId}:`, err);
  }
}

async function replaceSingleMessage(message: ChatMessage) {
  try {
    await db.transaction('rw', db.messages, async () => {
      await db.messages.delete(message.id); // delete the old message
      await db.messages.add(message); // insert the new one
    });
  } catch (err) {
    console.error(`Failed to replace single message:`, err);
  }
}

async function upsertMessages(messages: ChatMessage[]) {
  try {
    await db.messages.bulkPut(messages);
  } catch (err) {
    console.error(`Failed to upsert messages:`, err);
  }
}

async function upsertSingleMessage(message: ChatMessage) {
  try {
    await db.messages.put(message); // upsert the new one
  } catch (err) {
    console.error(`Failed to upsert single message:`, err);
  }
}

export {
  getRecentRooms,
  getRoomMessages,
  replaceAll,
  replaceAllRooms,
  replaceAllMessages,
  replaceRoomMessages,
  replaceSingleMessage,
  upsertMessages,
  upsertSingleMessage,
};

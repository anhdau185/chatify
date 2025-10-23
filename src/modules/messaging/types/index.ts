import type { PublicUser } from '@/modules/auth';

interface ChatRoom {
  id: string;
  name?: string; // for group chats
  members: Array<PublicUser['id']>; // user IDs
  isGroup: boolean;
}

interface ChatMessage {
  id: string;
  roomId: ChatRoom['id'];
  senderId: PublicUser['id'];
  senderName: PublicUser['name'];
  content?: string;
  imageUrl?: string;
  reactions?: Record<string, string[]>; // emoji -> userIds[]
  status: 'sending' | 'sent' | 'failed'; // add 'read' later
  createdAt: number;
}

interface WsPayloadJoin {
  roomId: ChatRoom['id'];
  senderId: PublicUser['id'];
}

type WsPayloadChat = ChatMessage;

interface WsMessageJoin {
  type: 'join';
  payload: WsPayloadJoin;
}

interface WsMessageChat {
  type: 'chat';
  payload: WsPayloadChat;
}

type WsMessage = WsMessageJoin | WsMessageChat;

export type {
  ChatMessage,
  ChatRoom,
  WsPayloadJoin,
  WsPayloadChat,
  WsMessageJoin,
  WsMessageChat,
  WsMessage,
};

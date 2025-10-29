import type { PublicUser } from '@/modules/auth';

interface ChatRoomsResponse {
  success: boolean;
  data: ChatRoom[];
}

interface ChatRoom {
  id: string;
  name?: string; // for group chats
  members: PublicUser[];
  isGroup: boolean;
  lastMsgAt: number; // timestamp of last message, 0 if no messages yet
  lastMsg?: ChatMessage; // preview of last message, unavailable if lastMsgAt is 0
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: number;
  senderName: string;
  content?: string;
  imageURLs?: Array<string | null>; // null for failed uploads
  pendingUploads?: number; // number of files being uploaded
  reactions: Record<string, Array<{ reactorId: number; reactorName: string }>>; // emoji -> user[]
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: number;
}

interface WsPayloadJoin {
  roomIds: string[];
  senderId: number;
}

interface WsMessageJoin {
  type: 'join';
  payload: WsPayloadJoin;
}

interface WsMessageChat {
  type: 'chat';
  payload: ChatMessage;
}

interface WsMessageReact {
  type: 'react';
  payload: ChatMessage;
}

type WsMessage = WsMessageJoin | WsMessageChat | WsMessageReact;

export type {
  ChatMessage,
  ChatRoom,
  ChatRoomsResponse,
  WsMessage,
  WsMessageChat,
  WsMessageJoin,
  WsMessageReact,
  WsPayloadJoin,
};

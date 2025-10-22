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
  content?: string;
  imageUrl?: string;
  reactions?: Record<string, string[]>; // emoji -> userIds[]
  status: 'sending' | 'sent' | 'failed'; // add 'read' later
  createdAt: number;
}

type WsMessage =
  | {
      type: 'join';
      payload: {
        roomId: ChatRoom['id'];
        senderId: PublicUser['id'];
      };
    }
  | {
      type: 'message';
      payload: ChatMessage;
    };

export type { ChatMessage, ChatRoom, WsMessage };

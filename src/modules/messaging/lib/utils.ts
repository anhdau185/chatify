import { cloneDeep, isEmpty } from 'lodash-es';

import { useChatStore } from '../store/chatStore';
import type { ChatMessage, ChatRoom } from '../types';

function buildReactions(
  emoji: string,
  reactions: ChatMessage['reactions'],
  reactor: { reactorId: number; reactorName: string },
) {
  const updatedReactions = cloneDeep(reactions);

  // Remove user from any existing reactions
  Object.keys(updatedReactions).forEach(existingEmoji => {
    updatedReactions[existingEmoji] = updatedReactions[existingEmoji].filter(
      ({ reactorId }) => reactorId !== reactor.reactorId,
    );

    // Clean up empty reaction arrays
    if (updatedReactions[existingEmoji].length === 0) {
      delete updatedReactions[existingEmoji];
    }
  });

  // Check if user is toggling off their reaction
  const reactors = reactions[emoji] || [];
  const isUserRepeatingThisEmoji = reactors.some(
    ({ reactorId }) => reactorId === reactor.reactorId,
  );

  // If user wasn't reacting with this emoji, add their reaction
  if (!isUserRepeatingThisEmoji) {
    if (!updatedReactions[emoji]) {
      updatedReactions[emoji] = [];
    }

    updatedReactions[emoji].push(reactor);
  }

  return updatedReactions;
}

function getRoomLatestActivity(
  lastMsg: ChatMessage | undefined,
  isOwnMsg: boolean,
) {
  if (!lastMsg) {
    return 'No messages yet';
  }

  if (lastMsg.content) {
    return lastMsg.content;
  }

  if (lastMsg.imageURLs && !isEmpty(lastMsg.imageURLs)) {
    const verb = isOwnMsg ? 'Sent' : 'Received';
    return `${verb} ${lastMsg.imageURLs.length} photo(s)`;
  }

  return 'Sent an attachment';
}

function getMessage(roomId: string, msgId: string): ChatMessage | null {
  const messagesByRoom = useChatStore.getState().messagesByRoom;
  const messages = messagesByRoom[roomId] || [];

  if (isEmpty(messages)) {
    return null;
  }

  const message = messages.find(m => m.id === msgId);

  if (!message) {
    return null;
  }

  return message;
}

function getDmChatPartner(room: ChatRoom, currentUserId: number) {
  if (room.isGroup) {
    return null;
  }

  return room.members.find(m => m.id !== currentUserId)!;
}

function getRoomName(room: ChatRoom, currentUserId: number) {
  if (room.isGroup) {
    return room.name!;
  }

  return getDmChatPartner(room, currentUserId)?.name || 'Unknown User';
}

export {
  buildReactions,
  getRoomLatestActivity,
  getMessage,
  getDmChatPartner,
  getRoomName,
};

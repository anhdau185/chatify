import { cloneDeep, isEmpty } from 'lodash-es';

import type { PublicUser } from '@/modules/auth';
import type { ChatMessage } from '../types';

function buildReactions(
  emoji: string,
  reactions: ChatMessage['reactions'],
  user: PublicUser,
) {
  const updatedReactions = cloneDeep(reactions);

  // Remove user from any existing reactions
  Object.keys(updatedReactions).forEach(existingEmoji => {
    updatedReactions[existingEmoji] = updatedReactions[existingEmoji].filter(
      ({ reactorId }) => reactorId !== user.id,
    );

    // Clean up empty reaction arrays
    if (updatedReactions[existingEmoji].length === 0) {
      delete updatedReactions[existingEmoji];
    }
  });

  // Check if user is toggling off their reaction
  const reactors = reactions[emoji] || [];
  const isUserRepeatingThisEmoji = reactors.some(r => r.reactorId === user.id);

  // If user wasn't reacting with this emoji, add their reaction
  if (!isUserRepeatingThisEmoji) {
    if (!updatedReactions[emoji]) {
      updatedReactions[emoji] = [];
    }

    updatedReactions[emoji].push({
      reactorId: user.id,
      reactorName: user.name,
    });
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

export { buildReactions, getRoomLatestActivity };

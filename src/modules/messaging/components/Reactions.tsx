import clsx from 'clsx';
import { Smile } from 'lucide-react';

import type { PublicUser } from '@/modules/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@components/ui/tooltip';
import * as db from '../db';
import { buildReactions } from '../lib/utils';
import { useChatStore } from '../store/chatStore';
import { useMessageQueueStore } from '../store/messageQueueStore';
import type { ChatMessage, WsMessageReact } from '../types';

const AVAILABLE_EMOJIS = ['👍', '❤️', '👏', '😂', '😮', '😢', '😡', '👎'];

export default function Reactions({
  message,
  user,
}: {
  message: ChatMessage;
  user: PublicUser;
}) {
  const isOwnMsg = message.senderId === user.id;
  const reactions = message.reactions;
  const hasReactions = Object.keys(reactions).length > 0;
  const updateMessage = useChatStore(state => state.updateMessage);
  const enqueue = useMessageQueueStore(state => state.enqueue);

  const handleReact = (emoji: string) => {
    const reactor = { reactorId: user.id, reactorName: user.name };
    const rebuiltReactions = buildReactions(emoji, reactions, reactor);
    const wsMessage: WsMessageReact = {
      type: 'react',
      payload: {
        id: message.id,
        roomId: message.roomId,
        emoji,
        reactor,
      },
    };

    updateMessage(message.roomId, message.id, { reactions: rebuiltReactions });
    db.patchMessage(message.id, { reactions: rebuiltReactions });
    enqueue(wsMessage);
  };

  return (
    <div
      className={clsx([
        'mt-2 flex items-center space-x-1',
        isOwnMsg ? 'justify-end' : 'justify-start',
      ])}
    >
      {/* Reactions */}
      {hasReactions && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(reactions).map(([emoji, reactors]) => (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <button
                  className={clsx([
                    'inline-flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-0.5 transition-all',
                    reactors.some(r => r.reactorId === user.id)
                      ? 'border-2 border-blue-500 bg-blue-100'
                      : 'border border-slate-200 bg-white hover:border-slate-300',
                  ])}
                  onClick={() => handleReact(emoji)}
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-medium text-slate-600">
                    {reactors.length}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {reactors.map(r => (
                  <p key={r.reactorId} className="text-xs">
                    {r.reactorId === user.id ? 'You' : r.reactorName}
                  </p>
                ))}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Add Reaction Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white p-1.5 transition-all hover:border-slate-300">
            <Smile className="h-4 w-4 text-slate-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-auto">
          <div className="flex gap-1">
            {AVAILABLE_EMOJIS.map(emoji => (
              <DropdownMenuItem
                key={emoji}
                className="px-2 py-1 text-lg"
                onClick={() => handleReact(emoji)}
              >
                {emoji}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

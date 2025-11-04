import clsx from 'clsx';
import { isEmpty } from 'lodash-es';
import { Check, TriangleAlert } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/modules/auth';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { TooltipProvider } from '@components/ui/tooltip';
import dayjs from '@shared/lib/dayjs';
import { abbreviate } from '@shared/lib/utils';
import * as db from '../db';
import { useChatStore, useMessagesInActiveRoom } from '../store/chatStore';
import { useMessageQueueStore } from '../store/messageQueueStore';
import type { ChatMessage, WsMessageChat } from '../types';
import PhotosGrid from './PhotosGrid';
import PhotosGridPlaceholder from './PhotosGridPlaceholder';
import Reactions from './Reactions';

export default function ConversationHistory() {
  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore(state => state.authenticatedUser!); // user is always non-nullable at this stage
  const activeRoomId = useChatStore(state => state.activeRoomId!); // activeRoomId is always non-nullable at this stage
  const replaceRoomMessages = useChatStore(state => state.replaceRoomMessages); // activeRoomId is always non-nullable at this stage
  const messages = useMessagesInActiveRoom();
  const updateMessage = useChatStore(state => state.updateMessage);
  const enqueue = useMessageQueueStore(state => state.enqueue);

  const scrollToBottom = () => {
    const element = conversationContainerRef.current;
    if (element) {
      element.scrollTo({ top: element.scrollHeight });
    }
  };

  useEffect(() => {
    if (!isEmpty(messages)) {
      return; // messages already loaded for this room, no need to query from db
    }

    // load messages from IndexedDB
    db.getRoomMessages(activeRoomId).then(messages => {
      if (!isEmpty(messages)) {
        replaceRoomMessages(activeRoomId, messages);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoomId]); // only watch for activeRoomId changes to avoid unnecessary effect re-runs when messages change

  // scroll to bottom when a new message gets added to the conversation
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length]);

  return (
    <div
      ref={conversationContainerRef}
      className="flex-1 space-y-4 overflow-y-auto p-6"
    >
      <TooltipProvider>
        {messages.map(msg => {
          const isOwnMsg = msg.senderId === user.id;
          return (
            <div
              key={msg.id}
              className={clsx([
                'flex',
                isOwnMsg ? 'justify-end' : 'justify-start',
              ])}
            >
              <div
                className={clsx([
                  'flex max-w-md gap-2',
                  isOwnMsg && 'flex-row-reverse',
                ])}
              >
                {!isOwnMsg && (
                  <Avatar className="mt-auto h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-xs font-semibold text-white">
                      {abbreviate(msg.senderName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  {/* Timestamp */}
                  <div
                    className={clsx([
                      'mb-1 flex items-center gap-1 px-1 text-xs text-slate-400',
                      isOwnMsg && 'justify-end',
                    ])}
                  >
                    {isOwnMsg && (
                      <>
                        {['pending', 'sending'].includes(msg.status) && (
                          <span>Sending...</span>
                        )}
                        {msg.status === 'retrying' && <span>Retrying...</span>}
                      </>
                    )}

                    {!['pending', 'sending', 'retrying'].includes(
                      msg.status,
                    ) && <span>{dayjs(msg.createdAt).format('HH:mm')}</span>}

                    {isOwnMsg &&
                      ['sent', 'retry-successful'].includes(msg.status) && (
                        <Check className="h-4 w-4" />
                      )}
                  </div>

                  {/* Placeholder Photo Grid for Uploads in Progress */}
                  {msg.pendingUploads && msg.pendingUploads > 0 && (
                    <PhotosGridPlaceholder
                      pendingUploads={msg.pendingUploads}
                    />
                  )}

                  {/* Photo Grid */}
                  {msg.imageURLs && !isEmpty(msg.imageURLs) && (
                    <PhotosGrid
                      imageURLs={msg.imageURLs}
                      isMsgFailed={msg.status === 'failed'}
                    />
                  )}

                  {/* Text Content */}
                  {msg.content && (
                    <div
                      className={clsx([
                        'rounded-2xl px-4 py-2',
                        isOwnMsg
                          ? 'rounded-br-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'rounded-bl-sm border border-slate-100 bg-white text-slate-800 shadow-sm',
                      ])}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  )}

                  {/* Reactions */}
                  {!msg.pendingUploads &&
                    !['pending', 'failed'].includes(msg.status) && (
                      <Reactions message={msg} user={user} />
                    )}

                  {/* Status Shown to Sender */}
                  {isOwnMsg && (
                    <>
                      {msg.status === 'delivered' && (
                        <p className="mt-1 px-1 text-right text-xs text-slate-400">
                          Delivered
                        </p>
                      )}
                      {msg.status === 'failed' && (
                        <div
                          className="mt-1 flex cursor-pointer items-center justify-end gap-1 px-1 text-xs text-red-600 transition-transform active:scale-95 active:opacity-80"
                          onClick={() => {
                            const payload: ChatMessage = {
                              ...msg,
                              status: 'retrying',
                            };
                            const wsMessage: WsMessageChat = {
                              type: 'chat',
                              payload,
                            };

                            // Immediately update UI and persist to DB
                            updateMessage(payload.roomId, payload.id, {
                              status: 'retrying',
                            });
                            db.patchMessage(payload.id, { status: 'retrying' });
                            enqueue(wsMessage);
                          }}
                        >
                          <TriangleAlert className="h-3 w-3" />
                          <span>Not sent. Click to retry</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </TooltipProvider>
    </div>
  );
}

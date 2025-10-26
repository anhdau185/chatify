import { isEmpty } from 'lodash-es';
import { MoreVertical, Paperclip, Send, Smile, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useAuthStore } from '@/modules/auth';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { TooltipProvider } from '@components/ui/tooltip';
import dayjs from '@shared/lib/dayjs';
import { abbreviate, getRoomName } from '@shared/lib/utils';
import * as db from '../db';
import * as wsClient from '../socket';
import {
  useActiveRoom,
  useChatStore,
  useMessagesInActiveRoom,
} from '../store/chatStore';
import type { ChatMessage, WsMessageChat } from '../types';
import Reactions from './Reactions';

export default function ConversationArea() {
  const [inputMsg, setInputMsg] = useState('');
  const user = useAuthStore(state => state.authenticatedUser!); // user is always non-nullable at this stage

  const addMessage = useChatStore(state => state.addMessage);
  const replaceRoomMessages = useChatStore(state => state.replaceRoomMessages);
  const activeRoomId = useChatStore(state => state.activeRoomId!); // activeRoomId is always non-nullable at this stage
  const activeRoom = useActiveRoom()!; // so is activeRoom, as a result
  const messages = useMessagesInActiveRoom();

  const handleSend = () => {
    const textMsgContent = inputMsg.trim();

    if (textMsgContent) {
      const payload: ChatMessage = {
        id: uuidv4(),
        roomId: activeRoomId,
        senderId: user.id,
        senderName: user.name,
        content: textMsgContent,
        reactions: {},
        status: 'sending',
        createdAt: Date.now(),
      };
      const wsMessage: WsMessageChat = {
        type: 'chat',
        payload,
      };

      wsClient.dispatch(wsMessage);
      addMessage(payload);
      db.upsertSingleMessage(payload);
      setInputMsg(''); // clear input after sending
    }
  };

  useEffect(() => {
    db.getRoomMessages(activeRoomId).then(messages => {
      if (!isEmpty(messages)) {
        replaceRoomMessages(activeRoomId, messages);
      }
    });
  }, [activeRoomId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-1 flex-col">
      {/* Conversation Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              {activeRoom.isGroup ? (
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                  <Users />
                </AvatarFallback>
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                  {abbreviate(activeRoom.members[0].name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">
              {getRoomName(activeRoom, user.id)}
            </h2>
            <p className="text-xs text-green-500">Active now</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreVertical className="h-5 w-5 text-slate-600" />
        </Button>
      </div>

      {/* Conversation History Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <TooltipProvider>
          {messages.map(msg => {
            const isOwnMsg = msg.senderId === user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMsg ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-md gap-2 ${isOwnMsg ? 'flex-row-reverse' : ''}`}
                >
                  {!isOwnMsg && (
                    <Avatar className="mt-auto h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-xs font-semibold text-white">
                        {abbreviate(msg.senderName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwnMsg
                          ? 'rounded-br-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'rounded-bl-sm border border-slate-100 bg-white text-slate-800 shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <Reactions message={msg} user={user} />
                    <p
                      className={`mt-1 px-1 text-xs text-slate-400 ${isOwnMsg ? 'text-right' : ''}`}
                    >
                      {dayjs(msg.createdAt).format('HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Chat Input Area */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-slate-500 hover:text-slate-700"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Input
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="rounded-xl border-slate-200 bg-slate-50 py-6 pr-12 focus:bg-white"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-purple-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

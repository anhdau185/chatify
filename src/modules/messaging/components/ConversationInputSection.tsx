import { Image as ImageIcon, Paperclip, Send, Smile, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useAuthStore } from '@/modules/auth';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { EXAMPLE_PHOTO_URL } from '@shared/constants';
import * as db from '../db';
import * as wsClient from '../socket';
import { useChatStore } from '../store/chatStore';
import type { ChatMessage, WsMessageChat } from '../types';

export default function ConversationInputSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputMsg, setInputMsg] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const user = useAuthStore(state => state.authenticatedUser!); // user is always non-nullable at this stage
  const addMessage = useChatStore(state => state.addMessage);
  const activeRoomId = useChatStore(state => state.activeRoomId!); // activeRoomId is always non-nullable at this stage

  const handleSend = () => {
    const textMsgContent = inputMsg.trim();

    if (textMsgContent || selectedFiles.length > 0) {
      const payload: ChatMessage = {
        id: uuidv4(),
        roomId: activeRoomId,
        senderId: user.id,
        senderName: user.name,
        content: textMsgContent,
        imageURLs: selectedFiles.map(() => EXAMPLE_PHOTO_URL), // TODO: implement photo upload flow and get actual photo URLs
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

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      {/* Preview of Chosen Files */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 p-2"
            >
              <ImageIcon className="h-4 w-4 text-slate-500" />
              <span className="max-w-[150px] truncate text-xs text-slate-600">
                {file.name}
              </span>
              <button
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-slate-200 transition-colors hover:bg-red-600 hover:text-white"
                onClick={() => {
                  setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* File Picker */}
        <Input
          multiple
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const files = e.target.files;
            if (files) {
              const fileArray = Array.from(files);
              setSelectedFiles(prev => [...prev, ...fileArray]);
            }
            // Reset input value to allow selecting the same file again
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-500 hover:text-slate-700"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text Input */}
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

        {/* Send Button */}
        <Button
          onClick={handleSend}
          className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-purple-700"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

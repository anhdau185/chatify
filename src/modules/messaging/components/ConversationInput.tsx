import { isEmpty } from 'lodash-es';
import { Image as ImageIcon, Loader2, Send, Smile, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { useAuthStore } from '@/modules/auth';
import { useUploadMultiple } from '@/modules/media';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import * as db from '../db';
import { useChatStore } from '../store/chatStore';
import { useMessageQueueStore } from '../store/messageQueueStore';
import type { ChatMessage, WsMessageChat } from '../types';
import PhotoThumbnail from './PhotoThumbnail';

export default function ConversationInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputMsg, setInputMsg] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const user = useAuthStore(state => state.authenticatedUser!); // user is always non-nullable at this stage
  const addMessage = useChatStore(state => state.addMessage);
  const updateMessage = useChatStore(state => state.updateMessage);
  const activeRoomId = useChatStore(state => state.activeRoomId!); // activeRoomId is always non-nullable at this stage
  const outboxReady = useMessageQueueStore(state => state.outboxReady);
  const enqueue = useMessageQueueStore(state => state.enqueue);
  const { mutateAsync: uploadMultiple } = useUploadMultiple();

  const handleSendTextOnlyMsg = () => {
    const payload: ChatMessage = {
      id: uuidv4(),
      roomId: activeRoomId,
      senderId: user.id,
      senderName: user.name,
      content: inputMsg.trim() || undefined,
      reactions: {},
      status: 'pending',
      createdAt: Date.now(),
    };
    const wsMessage: WsMessageChat = { type: 'chat', payload };

    setInputMsg(''); // clear input after sending
    addMessage(payload);
    window.requestIdleCallback(() => {
      db.upsertSingleMessage(payload);
    });
    enqueue(wsMessage);
  };

  const handleSendMsgWithPhotos = async () => {
    const placeholderMsg: ChatMessage = {
      id: uuidv4(),
      roomId: activeRoomId,
      senderId: user.id,
      senderName: user.name,
      content: inputMsg.trim() || undefined,
      pendingUploads: selectedFiles.length,
      reactions: {},
      status: 'pending',
      createdAt: Date.now(),
    };

    setInputMsg(''); // clear input after sending
    setSelectedFiles([]); // clear selected files after sending
    addMessage(placeholderMsg); // render immediately to user with photos placeholder

    try {
      const uploadResult = await uploadMultiple(selectedFiles);
      const allUploads = uploadResult.results.map(item =>
        item.success ? item.data.fileUrl : null,
      );
      const successfulUploads = allUploads.filter(
        url => url != null,
      ) as string[];

      const senderPayload: ChatMessage = {
        ...placeholderMsg,
        pendingUploads: undefined,
        imageURLs: allUploads, // show all photos (including failed ones) to sender
      };
      const receiverPayload: ChatMessage = {
        ...senderPayload,
        imageURLs: successfulUploads, // only show successful photos to other participants
      };
      const wsMessage: WsMessageChat = {
        type: 'chat',
        payload: receiverPayload,
      };

      // On success:
      updateMessage(senderPayload.roomId, senderPayload.id, senderPayload); // 1. Update UI to show uploaded photos to sender
      window.requestIdleCallback(() => {
        db.upsertSingleMessage(senderPayload); // 2. Insert message into DB
      });
      enqueue(wsMessage); // 3. Enqueue message to be sent to other participants
    } catch (err) {
      console.error('Failed to upload files:', err); // eslint-disable-line no-console

      // On failure:
      toast.error(`Failed to upload photos. ${(err as Error).message}`); // 1. Notify sender about the failure

      // 2. Mark the photo message as failed and not sending it to other chat participants
      // but still update the message status locally
      const senderPayload: ChatMessage = {
        ...placeholderMsg,
        pendingUploads: undefined,
        imageURLs: Array.from({ length: selectedFiles.length }, () => null), // all uploads failed
        status: 'failed',
      };
      updateMessage(senderPayload.roomId, senderPayload.id, senderPayload);
      window.requestIdleCallback(() => {
        db.upsertSingleMessage(senderPayload);
      });
    }
  };

  const handleSend = async () => {
    if (!outboxReady) {
      return;
    }

    const textMsgContent = inputMsg.trim();

    if (!textMsgContent && isEmpty(selectedFiles)) {
      return; // nothing to send
    }

    if (textMsgContent && isEmpty(selectedFiles)) {
      handleSendTextOnlyMsg();
    } else {
      handleSendMsgWithPhotos();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      {/* Preview of Chosen Files */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 p-2"
            >
              <PhotoThumbnail file={file} />
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

      <div className="flex items-center gap-4">
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
          className="h-8 w-8 text-slate-500 hover:text-slate-700"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>

        {/* Text Input */}
        <div className="relative flex-1">
          <Input
            disabled={!outboxReady}
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
          disabled={!outboxReady}
          className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-purple-700"
        >
          {outboxReady ? (
            <Send className="h-5 w-5" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
        </Button>
      </div>
    </div>
  );
}

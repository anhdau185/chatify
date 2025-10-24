import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';

import { useAuthStore } from '@/modules/auth';
import SkeletonScreen from '@components/SkeletonScreen';
import { useChatRoomsQuery } from '../api/queries';
import { useChatRooms, useChatStore } from '../store/chatStore';
import ChatSidebar from './ChatSidebar';
import ConversationArea from './ConversationArea';
import WebSocketWrapper from './WebSocketWrapper';

export default function ChatLayout() {
  const userId = useAuthStore(state => state.authenticatedUser!.id);
  const activeRoomId = useChatStore(state => state.activeRoomId);
  const localChatRooms = useChatRooms();

  const { isInProgress, refetch: fetchRoomsFromServer } =
    useChatRoomsQuery(userId);

  useEffect(() => {
    if (isEmpty(localChatRooms)) {
      fetchRoomsFromServer();
    }
  }, [localChatRooms]);

  if (isEmpty(localChatRooms) || isInProgress) {
    return <SkeletonScreen />;
  }

  return (
    <WebSocketWrapper>
      <div className="flex h-screen bg-slate-50">
        <ChatSidebar />
        {activeRoomId && <ConversationArea />}
      </div>
    </WebSocketWrapper>
  );
}

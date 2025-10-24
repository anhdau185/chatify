import { isEmpty } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { useAuthStore } from '@/modules/auth';
import SkeletonScreen from '@components/SkeletonScreen';
import { useChatRooms } from '../api/queries';
import { useChatStore } from '../store/chatStore';
import ChatSidebar from './ChatSidebar';
import ConversationArea from './ConversationArea';
import WebSocketWrapper from './WebSocketWrapper';

export default function ChatLayout() {
  const userId = useAuthStore(state => state.authenticatedUser!.id);
  const { isFetching, data: responseData } = useChatRooms(userId);
  const rooms = useMemo(() => responseData?.data || [], [responseData?.data]);
  const setRooms = useChatStore(state => state.setRooms);
  const activeRoomId = useChatStore(state => state.activeRoomId);

  useEffect(() => {
    if (!isEmpty(rooms)) setRooms(rooms);
  }, [rooms]);

  if (isFetching || !responseData) {
    return <SkeletonScreen />;
  }

  return (
    <WebSocketWrapper>
      <div className="flex h-screen bg-slate-50">
        <ChatSidebar rooms={rooms} />
        {activeRoomId && <ConversationArea />}
      </div>
    </WebSocketWrapper>
  );
}

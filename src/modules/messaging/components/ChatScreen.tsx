import { useEffect } from 'react';
import { Navigate } from 'react-router';

import { useAuthStore } from '@/modules/auth';
import SkeletonScreen from '@components/SkeletonScreen';
import { ALL_MOCK_CHAT_ROOMS } from '../mocks';
import { useSelectedRoomStore } from '../store';
import ChatSidebar from './ChatSidebar';
import ConversationArea from './ConversationArea';

function ChatLayout() {
  // TODO: Fetch chat rooms then get list and selected ID from there
  const { selectedRoom, setSelectedRoom } = useSelectedRoomStore();

  useEffect(() => {
    if (ALL_MOCK_CHAT_ROOMS.length > 0) {
      setSelectedRoom(ALL_MOCK_CHAT_ROOMS[0]);
    }
  }, [setSelectedRoom]);

  if (!selectedRoom) {
    return (
      <div className="flex h-screen bg-slate-50">
        <SkeletonScreen />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <ChatSidebar rooms={ALL_MOCK_CHAT_ROOMS} />
      <ConversationArea />
    </div>
  );
}

export default function ChatScreen() {
  const isAuthenticated = useAuthStore(state => !!state.access);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <ChatLayout />;
}

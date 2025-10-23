import { useEffect, useMemo } from 'react';

import { useAuthStore } from '@/modules/auth';
import SkeletonScreen from '@components/SkeletonScreen';
import { useChatRooms } from '../api/queries';
import { useSelectedRoomStore } from '../store';
import ChatSidebar from './ChatSidebar';
import ConversationArea from './ConversationArea';

export default function ChatLayout() {
  const userId = useAuthStore(state => state.authenticatedUser!.id);
  const { isFetching, data: responseData } = useChatRooms(userId);
  const rooms = useMemo(() => responseData?.data || [], [responseData?.data]);
  const { selectedRoom, setSelectedRoom } = useSelectedRoomStore();

  useEffect(() => {
    // initially auto-select the first room if none is selected
    if (!selectedRoom && rooms.length > 0) {
      setSelectedRoom(rooms[0]);
    }
  }, [selectedRoom, rooms, setSelectedRoom]);

  if (isFetching || !selectedRoom) {
    return (
      <div className="flex h-screen bg-slate-50">
        <SkeletonScreen />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <ChatSidebar rooms={rooms} />
      <ConversationArea />
    </div>
  );
}

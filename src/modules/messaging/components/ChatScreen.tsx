import { Navigate } from 'react-router';

import { useAuthStore } from '@/modules/auth';
import { CONTACTS, ROOM_ID } from '../mocks';
import ChatSidebar from './ChatSidebar';
import ConversationArea from './ConversationArea';

function ChatLayout() {
  // TODO: Fetch chat rooms then get list and selected ID from there
  return (
    <div className="flex h-screen bg-slate-50">
      <ChatSidebar contacts={CONTACTS} />
      <ConversationArea roomId={ROOM_ID} />
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

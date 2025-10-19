import { Navigate } from 'react-router';

import { useAuthStore } from '@/modules/auth';
import ChatSidebar from './ChatSidebar';
import ConversationArea from './ConversationArea';

function ChatLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <ChatSidebar />
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

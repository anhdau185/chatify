import { useAuthentication } from '@/modules/auth';
import { Navigate } from 'react-router';
import ChatSidebar from './ChatSidebar';
import ChatSkeleton from './ChatSkeleton';
import ConversationArea from './ConversationArea';

export default function ChatScreen() {
  const { isFetching, isAuthenticated } = useAuthentication();

  if (isFetching) {
    return <ChatSkeleton />; // TODO: implement actual chat skeleton
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <ChatSidebar />
      <ConversationArea />
    </div>
  );
}

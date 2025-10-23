import { Navigate } from 'react-router';

import { useAuthStore } from '@/modules/auth';
import ChatLayout from './ChatLayout';

export default function ChatScreen() {
  const isAuthenticated = useAuthStore(state => !!state.access);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <ChatLayout />;
}

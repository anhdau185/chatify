import { Navigate } from 'react-router';

import { useIsAuthenticated } from '@/modules/auth';
import ChatLayout from './ChatLayout';

export default function ChatScreen() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <ChatLayout />;
}

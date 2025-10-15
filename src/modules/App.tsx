import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router';

import { LoginScreen } from '@/modules/login';
import { useAuthStore } from '@/modules/shared/store/authStore';
import ChatScreen from './chat/components';

const queryClient = new QueryClient();

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default function App() {
  const { user } = useAuthStore();
  const isAuthenticated = user != null;

  return (
    <Providers>
      <HashRouter>
        <Routes>
          <Route
            path="/"
            index
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <LoginScreen />
              )
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? <ChatScreen /> : <Navigate to="/" replace />
            }
          />
        </Routes>
      </HashRouter>
    </Providers>
  );
}

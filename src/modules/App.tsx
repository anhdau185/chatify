import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router';

import { ChatScreen } from '@/modules/chat';
import { LoginScreen } from '@/modules/login';
import { Toaster as GlobalToaster } from '@components/ui/sonner';
import { useAuthStore } from '@shared/store/authStore';

const queryClient = new QueryClient();

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <GlobalToaster position="top-center" />
    </>
  );
}

function AppRoutes() {
  const { user } = useAuthStore();
  const isAuthenticated = user != null;

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          index
          element={
            isAuthenticated ? <Navigate to="/chat" replace /> : <LoginScreen />
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
  );
}

export default function App() {
  return (
    <RootLayout>
      <AppRoutes />
    </RootLayout>
  );
}

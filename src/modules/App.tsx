import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router';

import { ChatScreen } from '@/modules/chat';
import { LoginScreen } from '@/modules/login';
import { Toaster as GlobalToaster } from '@components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <GlobalToaster position="top-center" />
    </>
  );
}

// this is where all routes are declared
function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
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

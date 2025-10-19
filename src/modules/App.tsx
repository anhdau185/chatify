import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router';

import { LoginScreen, useAuthentication } from '@/modules/auth';
import { ChatScreen } from '@/modules/messaging';
import NotFoundScreen from '@components/NotFoundScreen';
import SkeletonScreen from '@components/SkeletonScreen';
import { Toaster as GlobalToaster } from '@components/ui/sonner';
import { inDesktopEnv } from '@shared/lib/utils';

// BrowserRouter won't work with Electron apps
const Router = inDesktopEnv() ? HashRouter : BrowserRouter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInitializer({ children }: { children: ReactNode }) {
  const { isFetching } = useAuthentication();

  if (isFetching) {
    return <SkeletonScreen />;
  }

  return <>{children}</>;
}

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AppInitializer>{children}</AppInitializer>
      </QueryClientProvider>
      <GlobalToaster position="top-center" />
    </>
  );
}

// Routes are declared here
function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <RootLayout>
      <AppRoutes />
    </RootLayout>
  );
}

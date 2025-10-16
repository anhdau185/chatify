import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router';

import { LoginScreen } from '@/modules/auth';
import { ChatScreen } from '@/modules/messaging';
import { Toaster as GlobalToaster } from '@components/ui/sonner';

// TODO: check browser or Electron environment in main process
// then choose between BrowserRouter or HashRouter here
// eslint-disable-next-line no-constant-condition
const Router = true ? HashRouter : BrowserRouter;

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

// Routes are declared here
function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
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

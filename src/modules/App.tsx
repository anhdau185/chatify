import { HashRouter, Navigate, Route, Routes } from 'react-router';
import ChatScreen from './chat/components';
import LoginScreen from './login/components';
import { useAuthStore } from './shared/store/authStore';

export default function App() {
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

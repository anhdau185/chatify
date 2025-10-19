import { Lock } from 'lucide-react';
import { Navigate } from 'react-router';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { useAuthStore } from '../store';
import LoginForm from './LoginForm';

function LoginLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to continue to Chatify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginScreen() {
  const isAuthenticated = useAuthStore(state => !!state.access);

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <LoginLayout />;
}

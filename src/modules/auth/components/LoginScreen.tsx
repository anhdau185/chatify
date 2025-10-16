import { Lock } from 'lucide-react';
import { Navigate } from 'react-router';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { useAuthentication } from '@shared/api';
import LoginForm from './LoginForm';

function PendingCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="h-full max-w-md border-0 shadow-xl">
        <div className="flex flex-col space-y-5 px-10 py-4">
          <Skeleton className="h-[125px] w-[300px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-[240px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-[240px]" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function LoginCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black">
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
  const { isFetching, isAuthenticated } = useAuthentication();

  if (isFetching) {
    return <PendingCard />;
  }

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <LoginCard />;
}

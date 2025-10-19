import { AlertCircle, Home } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@components/ui/button';

export default function NotFoundScreen() {
  const navigate = useNavigate();
  const onGoHome = useCallback(() => navigate('/'), []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20" />
          </div>
        </div>

        <h1 className="mb-3 text-4xl font-bold text-slate-800">
          404 - Page Not Found
        </h1>
        <p className="mb-8 leading-relaxed text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            onClick={onGoHome}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Home className="mr-1 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

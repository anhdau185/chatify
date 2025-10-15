import { Lock, User2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Alert, AlertDescription } from '@components/ui/alert';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    // handle form logic here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Username
        </Label>
        <div className="relative">
          <User2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            required
            id="email"
            type="text"
            placeholder="you@example.com"
            className="pl-10"
            disabled={false}
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            required
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            disabled={false}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
      </div>

      {false && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-sm">{'error_msg'}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full cursor-pointer" disabled={false}>
        {/* {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )} */}
        Sign in
      </Button>
    </form>
  );
}

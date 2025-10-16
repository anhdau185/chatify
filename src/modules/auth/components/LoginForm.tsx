import { Loader2, Lock, User2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { useLogin } from '../api/mutations';

const MIN_USERNAME_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 6;

export default function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: login, isPending: isLoggingIn } = useLogin({
    onSuccess({ authenticatedUser }) {
      toast.success(`Welcome back, ${authenticatedUser.name}! 🚀`);
      setTimeout(() => navigate('/chat', { replace: true }));
    },
    onError({ message }) {
      toast.error(message);
    },
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Username and password are required');
      return;
    }

    const usernameTooShort = username.length < MIN_USERNAME_LENGTH;
    if (usernameTooShort) {
      toast.error(
        `Username must be at least ${MIN_USERNAME_LENGTH} characters long`,
      );
      return;
    }

    const passwordTooShort = password.length < MIN_PASSWORD_LENGTH;
    if (passwordTooShort) {
      toast.error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      );
      return;
    }

    // validation is ok, now proceed to call login API
    login({ username, password });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
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
            disabled={isLoggingIn}
            value={username}
            onChange={e => setUsername(e.target.value.trim())}
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
            disabled={isLoggingIn}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full cursor-pointer"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}

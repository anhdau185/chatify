import { useAuthStore, useLogout } from '@/modules/auth';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { abbreviate } from '@shared/lib/utils';

export default function MyAccountDropdown() {
  const user = useAuthStore(state => state.authenticatedUser);
  const { mutate: logout } = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full transition-all hover:ring-2 hover:ring-blue-500/20"
        >
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 font-semibold text-white">
              {user ? abbreviate(user.name) : 'ME'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm leading-none font-medium">My Account</p>
            {user && (
              <p className="text-xs leading-none text-slate-500">{`${user.name} (@${user.username})`}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="text-red-600 focus:text-red-600"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

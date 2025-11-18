import { MessageSquareX, MoreVertical, Users } from 'lucide-react';

import { useAuthStore } from '@/modules/auth';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { abbreviate } from '@shared/lib/utils';
import { getRoomName } from '../lib/utils';
import { useActiveRoom, useChatStore } from '../store/chatStore';

function ConversationHeaderMenu() {
  const setActiveRoomId = useChatStore(state => state.setActiveRoomId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreVertical className="h-5 w-5 text-slate-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setActiveRoomId(null)}
          className="text-red-600 focus:text-red-600"
        >
          <MessageSquareX className="mr-0 h-4 w-4 text-red-600" />
          <span>Close chat</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ConversationHeader() {
  const userId = useAuthStore(state => state.authenticatedUser!.id); // user is always non-nullable at this stage
  const activeRoom = useActiveRoom()!; // activeRoom is always non-nullable at this stage

  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            {activeRoom.isGroup ? (
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                <Users />
              </AvatarFallback>
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                {abbreviate(activeRoom.members[0].name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">
            {getRoomName(activeRoom, userId)}
          </h2>
          <p className="text-xs text-green-500">Active now</p>
        </div>
      </div>

      <ConversationHeaderMenu />
    </div>
  );
}

import { Search, Sidebar, Users } from 'lucide-react';

import { useAuthStore } from '@/modules/auth';
import { MyAccountDropdown } from '@/modules/user';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { abbreviate } from '@shared/lib/utils';
import { useSelectedRoomStore } from '../store/selectedRoomStore';
import type { ChatRoom } from '../types';

export default function ChatSidebar({ rooms }: { rooms: ChatRoom[] }) {
  const user = useAuthStore(state => state.authenticatedUser!); // user should always be non-nullable at this stage
  const selectedRoom = useSelectedRoomStore(state => state.selectedRoom!); // selectedRoom should always be non-nullable at this stage
  const setSelectedRoom = useSelectedRoomStore(state => state.setSelectedRoom);

  return (
    <div className="flex w-80 flex-col border-r border-slate-200 bg-white">
      {/* Sidebar Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Sidebar className="text-slate-600" />
            </Button>
            <h1 className="bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-500 bg-clip-text text-xl font-bold text-transparent">
              Chatify
            </h1>
          </div>

          <MyAccountDropdown />
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Find contacts..."
            className="border-slate-200 bg-slate-50 pl-10"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.map(room => {
          const isOnline = true;
          const isRoomSelected = room.id === selectedRoom?.id;
          const dmChatPartner = !room.isGroup
            ? room.members.find(member => member.id !== user.id)!
            : null;

          return (
            <div
              key={room.id}
              className={`flex cursor-pointer items-center gap-3 p-4 transition-colors ${
                isRoomSelected
                  ? 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50'
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => {
                if (!isRoomSelected) setSelectedRoom(room);
              }}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  {room.isGroup ? (
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                      <Users />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                      {abbreviate(dmChatPartner!.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isOnline && (
                  <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="truncate font-semibold text-slate-800">
                    {room.isGroup ? room.name! : dmChatPartner!.name}
                  </h3>
                  {/* <span className="text-xs text-slate-500">{room.time}</span> */}
                </div>
                {/* <p className="truncate text-sm text-slate-500">{room.lastMsg}</p> */}
              </div>
              {/* {contact.unread > 0 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                  {room.unreadCount}
                </div>
              )} */}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import clsx from 'clsx';
import { isEmpty } from 'lodash-es';
import { Search, Sidebar, Users } from 'lucide-react';
import { useEffect } from 'react';

import { useAuthStore } from '@/modules/auth';
import { MyAccountDropdown } from '@/modules/user';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Skeleton } from '@components/ui/skeleton';
import dayjs from '@shared/lib/dayjs';
import { abbreviate } from '@shared/lib/utils';
import { useChatRoomsQuery } from '../api/queries';
import * as db from '../db';
import {
  getDmChatPartner,
  getRoomLatestActivity,
  getRoomName,
} from '../lib/utils';
import { useChatStore, useRecentChatRooms } from '../store/chatStore';
import SyncAlertBanner from './SyncAlertBanner';

export default function ChatSidebar() {
  const userId = useAuthStore(state => state.authenticatedUser!.id); // user should always be non-nullable at this stage
  const { refetch: fetchRoomsApi, isFetching } = useChatRoomsQuery(userId);

  const rooms = useRecentChatRooms();
  const setRooms = useChatStore(state => state.setRooms);

  const activeRoomId = useChatStore(state => state.activeRoomId);
  const setActiveRoomId = useChatStore(state => state.setActiveRoomId);

  useEffect(() => {
    db.getRecentRooms(userId).then(rooms => {
      if (!isEmpty(rooms)) {
        setRooms(rooms);
      } else {
        fetchRoomsApi();
      }
    });
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // if none is selected, select and show the last active room by default
  useEffect(() => {
    if (!activeRoomId && !isEmpty(rooms)) {
      setActiveRoomId(rooms[0].id);
    }
  }, [activeRoomId, rooms]); // eslint-disable-line react-hooks/exhaustive-deps

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
        {/* Alert Banners */}
        <div className="p-2">
          <SyncAlertBanner />
        </div>

        {isFetching &&
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}

        {rooms.map(room => {
          const isOnline = true;
          const isRoomSelected = room.id === activeRoomId;
          return (
            <div
              key={room.id}
              className={clsx([
                'flex cursor-pointer items-center gap-3 p-4 transition-colors',
                isRoomSelected
                  ? 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50'
                  : 'hover:bg-slate-50',
              ])}
              onClick={() => setActiveRoomId(room.id)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  {room.isGroup ? (
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                      <Users />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                      {abbreviate(getDmChatPartner(room, userId)!.name)}
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
                    {getRoomName(room, userId)}
                  </h3>
                  {room.lastMsgAt > 0 && (
                    <span className="text-xs text-slate-400">
                      {dayjs(room.lastMsgAt).format('HH:mm')}
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-slate-400">
                  {getRoomLatestActivity(
                    room.lastMsg,
                    room.lastMsg?.senderId === userId,
                  )}
                </p>
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

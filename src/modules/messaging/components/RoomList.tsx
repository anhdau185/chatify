import clsx from 'clsx';
import { isEmpty } from 'lodash-es';
import { Users } from 'lucide-react';
import { useEffect } from 'react';

import { useAuthStore } from '@/modules/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Skeleton } from '@components/ui/skeleton';
import { SELF_CHAT_ROOM_NAME } from '@shared/constants';
import dayjs from '@shared/lib/dayjs';
import { abbreviate } from '@shared/lib/utils';
import myDocumentsAvatar from '@shared/static/images/myDocumentsAvatar.png';
import { useChatRoomsQuery } from '../api/queries';
import * as db from '../db';
import {
  getDmChatPartner,
  getRoomLatestActivity,
  getRoomName,
} from '../lib/utils';
import { useChatStore, useRecentChatRooms } from '../store/chatStore';

export default function RoomList() {
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

  if (isFetching) {
    return (
      <>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {rooms.map(room => {
        const isOnline = true;
        const isRoomSelected = room.id === activeRoomId;
        const isSelfChat =
          room.members.length === 1 && room.members[0].id === userId;

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
                {(function () {
                  if (isSelfChat) {
                    return (
                      <AvatarImage src={myDocumentsAvatar} alt="Self Avatar" />
                    );
                  }

                  if (room.isGroup) {
                    return (
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                        <Users />
                      </AvatarFallback>
                    );
                  }

                  return (
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
                      {abbreviate(getDmChatPartner(room, userId)!.name)}
                    </AvatarFallback>
                  );
                })()}
              </Avatar>
              {isOnline && !isSelfChat && (
                <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="truncate font-semibold text-slate-800">
                  {isSelfChat ? SELF_CHAT_ROOM_NAME : getRoomName(room, userId)}
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
                  isSelfChat,
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
    </>
  );
}

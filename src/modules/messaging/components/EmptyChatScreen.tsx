import clsx from 'clsx';
import { noop } from 'lodash-es';
import { Lightbulb, Settings, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { useAuthStore } from '@/modules/auth';
import CarouselSlider from '@components/CarouselSlider';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { abbreviate } from '@shared/lib/utils';
import { focusSearchInput } from '../lib/searchFocus';
import { getDmChatPartner, getRoomName } from '../lib/utils';
import { useChatStore, useRecentChatRooms } from '../store/chatStore';

function ContactItem({
  name,
  avatar,
  onClickAvatar = noop,
  isSelf = false,
}: {
  name: string;
  avatar: ReactNode;
  onClickAvatar?: () => void;
  isSelf?: boolean;
}) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full transition-all hover:ring-2 hover:ring-blue-500/20 active:scale-95"
        onClick={onClickAvatar}
      >
        <Avatar className="h-12 w-12">
          <AvatarFallback
            className={clsx([
              'bg-gradient-to-br font-semibold text-white',
              isSelf
                ? 'from-emerald-400 to-cyan-500'
                : 'from-blue-400 to-purple-500',
            ])}
          >
            {avatar}
          </AvatarFallback>
        </Avatar>
      </Button>
      <div className="flex flex-col items-center">
        <p className="truncate text-xs font-semibold text-slate-700 select-none">
          {isSelf ? 'You' : name}
        </p>
        {isSelf && (
          <p className="truncate text-xs font-semibold text-slate-700 select-none">
            (Notetaking)
          </p>
        )}
      </div>
    </div>
  );
}

export default function EmptyChatScreen() {
  const user = useAuthStore(state => state.authenticatedUser!); // user should always be non-nullable at this stage
  const setActiveRoomId = useChatStore(state => state.setActiveRoomId);
  const rooms = useRecentChatRooms();

  return (
    <div className="flex flex-1 items-center justify-center pb-16">
      <CarouselSlider>
        <Card className="w-full max-w-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <CardTitle className="text-center font-bold">
                Quick Chats
              </CardTitle>
            </div>
            <CardDescription className="w-full text-center text-slate-500">
              Click on an avatar to start chatting:
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex justify-center gap-5">
              {rooms.map(room => (
                <ContactItem
                  key={room.id}
                  name={getRoomName(room, user.id)}
                  avatar={
                    room.isGroup ? (
                      <Users />
                    ) : (
                      abbreviate(getDmChatPartner(room, user.id)!.name)
                    )
                  }
                  onClickAvatar={() => setActiveRoomId(room.id)}
                />
              ))}

              <ContactItem
                key="room-0"
                isSelf
                name={user.name}
                avatar={abbreviate(user.name)}
              />
            </div>
          </CardContent>

          <CardFooter>
            <CardDescription className="w-full text-center text-xs">
              <span className="text-slate-400">
                {"Not who you're looking for? Use "}
              </span>
              <span
                className="cursor-pointer text-blue-400"
                onClick={focusSearchInput}
              >
                Search
              </span>
              <span className="text-slate-400">
                {' to find your contacts.'}
              </span>
            </CardDescription>
          </CardFooter>
        </Card>

        <Card className="w-full max-w-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-center space-x-2">
              <Settings className="h-6 w-6" />
              <CardTitle className="text-center font-bold">
                Quick Settings
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            {'[Put a high-value, quick personalization here]'}
          </CardContent>

          <CardFooter>
            <CardDescription className="w-full text-center text-xs">
              <span className="text-slate-400">
                {'You can change this as well as many other settings in '}
              </span>
              <span className="cursor-pointer text-blue-400">Preferences</span>
              <span className="text-slate-400">.</span>
            </CardDescription>
          </CardFooter>
        </Card>
      </CarouselSlider>
    </div>
  );
}

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
import { getDmChatPartner, getRoomName } from '../lib/utils';
import { useChatStore, useRecentChatRooms } from '../store/chatStore';

function ContactItem({
  name,
  avatar,
  onClickAvatar = noop,
}: {
  name: string;
  avatar: ReactNode;
  onClickAvatar?: () => void;
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
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white">
            {avatar}
          </AvatarFallback>
        </Avatar>
      </Button>
      <span className="truncate text-xs font-semibold text-slate-700 select-none">
        {name}
      </span>
    </div>
  );
}

export default function EmptyChatScreen() {
  const userId = useAuthStore(state => state.authenticatedUser!.id); // user should always be non-nullable at this stage
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
            <div className="flex justify-center gap-4">
              {rooms.map(room => (
                <ContactItem
                  key={room.id}
                  name={getRoomName(room, userId)}
                  avatar={
                    room.isGroup ? (
                      <Users />
                    ) : (
                      abbreviate(getDmChatPartner(room, userId)!.name)
                    )
                  }
                  onClickAvatar={() => setActiveRoomId(room.id)}
                />
              ))}

              <ContactItem key="placeholder1" name="Matt" avatar="MC" />
            </div>
          </CardContent>

          <CardFooter>
            <CardDescription className="w-full text-center text-xs">
              <span className="text-slate-400">
                {
                  'Showing your favorites only. You can see all your contacts in '
                }
              </span>
              <span className="cursor-pointer text-blue-400">Phonebook</span>
              <span className="text-slate-400">.</span>
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

import { Sidebar } from 'lucide-react';

import { MyAccountDropdown } from '@/modules/user';
import { Button } from '@components/ui/button';
import RoomList from './RoomList';
import SearchBar from './SearchBar';
import SyncAlertBanner from './SyncAlertBanner';

export default function ChatSidebar() {
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

        <SearchBar />
      </div>

      {/* Alert Banners and Rooms */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden p-2">
          <SyncAlertBanner />
        </div>

        <RoomList />
      </div>
    </div>
  );
}

import { useChatStore } from '../store/chatStore';
import ChatSidebar from './ChatSidebar';
import ConversationArea from './ConversationArea';
import WebSocketWrapper from './WebSocketWrapper';

export default function ChatLayout() {
  const activeRoomId = useChatStore(state => state.activeRoomId);

  return (
    <WebSocketWrapper>
      <div className="flex h-screen bg-slate-50">
        <ChatSidebar />
        {activeRoomId && <ConversationArea />}
      </div>
    </WebSocketWrapper>
  );
}

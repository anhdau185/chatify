import ChatSidebar from './ChatSidebar';
import ConversationArea from './ConversationArea';
import WebSocketWrapper from './WebSocketWrapper';

export default function ChatLayout() {
  return (
    <WebSocketWrapper>
      <div className="flex h-screen bg-slate-50">
        <ChatSidebar />
        <ConversationArea />
      </div>
    </WebSocketWrapper>
  );
}

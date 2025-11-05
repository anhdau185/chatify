import ChatSidebar from './ChatSidebar';
import ConnectivityWrapper from './ConnectivityWrapper';
import ConversationArea from './ConversationArea';

export default function ChatLayout() {
  return (
    <ConnectivityWrapper>
      <div className="flex h-screen bg-slate-50">
        <ChatSidebar />
        <ConversationArea />
      </div>
    </ConnectivityWrapper>
  );
}

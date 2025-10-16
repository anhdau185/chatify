import ChatSidebar from './ChatSidebar';
import ConversationArea from './ConversationArea';

export default function ChatScreen() {
  return (
    <div className="flex h-screen bg-slate-50">
      <ChatSidebar />
      <ConversationArea />
    </div>
  );
}

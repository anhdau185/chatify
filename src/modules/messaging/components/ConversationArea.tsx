import { useChatStore } from '../store/chatStore';
import ConversationHeader from './ConversationHeader';
import ConversationHistory from './ConversationHistory';
import ConversationInputSection from './ConversationInputSection';

export default function ConversationArea() {
  const activeRoomId = useChatStore(state => state.activeRoomId);

  if (!activeRoomId) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <ConversationHeader />
      <ConversationHistory />
      <ConversationInputSection />
    </div>
  );
}

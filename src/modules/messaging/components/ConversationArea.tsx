import { useChatStore } from '../store/chatStore';
import ConversationHeader from './ConversationHeader';
import ConversationHistory from './ConversationHistory';
import ConversationInput from './ConversationInput';
import EmptyChatScreen from './EmptyChatScreen';

export default function ConversationArea() {
  const activeRoomId = useChatStore(state => state.activeRoomId);

  if (!activeRoomId) {
    return <EmptyChatScreen />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <ConversationHeader />
      <ConversationHistory />
      <ConversationInput />
    </div>
  );
}

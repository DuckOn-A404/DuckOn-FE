import ChatPanel from "./ChatPanel";
import PlaylistPanel from "./PlaylistPanel";
import type { ChatMessage } from "../../types/chat";

type RightSidebarProps = {
  selectedTab: "chat" | "playlist";
  isHost: boolean;
  roomId: string | undefined;
  messages: ChatMessage[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
};

const RightSidebar = ({
  selectedTab,
  isHost,
  messages,
  isConnected,
  sendMessage,
}: RightSidebarProps) => {
  return (
    <div className="flex-grow overflow-y-auto p-4">
      {selectedTab === "chat" ? (
        <ChatPanel
          messages={messages}
          isConnected={isConnected}
          sendMessage={sendMessage}
        />
      ) : (
        <PlaylistPanel isHost={isHost} />
      )}
    </div>
  );
};

export default RightSidebar;

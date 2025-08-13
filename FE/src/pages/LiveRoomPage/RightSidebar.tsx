import ChatPanel from "./ChatPanel";
import PlaylistPanel from "./PlaylistPanel";
import type { ChatMessage } from "../../types/chat";

type RightSidebarProps = {
  selectedTab: "chat" | "playlist";
  isHost: boolean;
  roomId: string | undefined;
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  playlist: string[];
  currentVideoIndex: number;
  onAddToPlaylist: (videoId: string) => void;
  onSelectPlaylistIndex?: (index: number) => void;
};

const RightSidebar = ({
  selectedTab,
  isHost,
  messages,
  sendMessage,
  playlist,
  currentVideoIndex,
  onAddToPlaylist,
  onSelectPlaylistIndex,
}: RightSidebarProps) => {
  return (
    <div className="flex-grow flex flex-col bg-gray-800">
      {selectedTab === "chat" ? (
        <ChatPanel messages={messages} sendMessage={sendMessage} />
      ) : (
        <PlaylistPanel
          isHost={isHost}
          playlist={playlist}
          currentVideoIndex={currentVideoIndex}
          onAddToPlaylist={onAddToPlaylist}
          onSelect={onSelectPlaylistIndex}
        />
      )}
    </div>
  );
};

export default RightSidebar;

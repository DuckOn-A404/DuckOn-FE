import ChatPanel from "./ChatPanel";
import PlaylistPanel from "./PlaylistPanel";
import type { ChatMessage } from "../../types/chat";

type RightSidebarProps = {
  selectedTab: "chat" | "playlist";
  isHost: boolean;
  roomId: string | undefined;
  messages: ChatMessage[];
  // 반환 타입을 Promise<void> | void 로 확장
  sendMessage: (content: string) => Promise<void> | void;
  playlist: string[];
  currentVideoIndex: number;
  onAddToPlaylist: (videoId: string) => void;
  onSelectPlaylistIndex?: (index: number) => void;
  onBlockUser: (userId: string) => void;
  onReorderPlaylist?: (from: number, to: number) => void;
  onDeletePlaylistItem?: (index: number) => void;
  /** 강퇴 콜백 */
  onEjectUser?: (user: { id: string; nickname: string }) => void;
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
  onBlockUser,
  onReorderPlaylist,
  onDeletePlaylistItem,
  onEjectUser,
}: RightSidebarProps) => {
  return (
    <div className="flex-grow flex flex-col bg-gray-800 min-h-0">
      {selectedTab === "chat" ? (
        <ChatPanel
          messages={messages}
          sendMessage={sendMessage}
          onBlockUser={onBlockUser}
          isHost={isHost}
          /** 여기서 ChatPanel로 넘김 */
          onEjectUser={onEjectUser}
        />
      ) : (
        <PlaylistPanel
          isHost={isHost}
          playlist={playlist}
          currentVideoIndex={currentVideoIndex}
          onAddToPlaylist={onAddToPlaylist}
          onSelect={onSelectPlaylistIndex}
          onReorder={onReorderPlaylist}
          onDeleteItem={onDeletePlaylistItem}
        />
      )}
    </div>
  );
};

export default RightSidebar;

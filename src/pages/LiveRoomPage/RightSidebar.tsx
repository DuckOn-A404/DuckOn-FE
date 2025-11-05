// import ChatPanel from "./ChatPanel";
// import PlaylistPanel from "./PlaylistPanel";
// import type { ChatMessage } from "../../types/chat";

// type RightSidebarProps = {
//   selectedTab: "chat" | "playlist";
//   isHost: boolean;
//   roomId: string | undefined;
//   messages: ChatMessage[];
//   sendMessage: (content: string) => void;
//   playlist: string[];
//   currentVideoIndex: number;
//   onAddToPlaylist: (videoId: string) => void;
//   onSelectPlaylistIndex?: (index: number) => void;
//   onBlockUser: (userId: string) => void;
//   onReorderPlaylist?: (from: number, to: number) => void;
//   onDeletePlaylistItem?: (index: number) => void;
// };

// const RightSidebar = ({
//   selectedTab,
//   isHost,
//   // roomId, // (필요시 유지)
//   messages,
//   sendMessage,
//   playlist,
//   currentVideoIndex,
//   onAddToPlaylist,
//   onSelectPlaylistIndex,
//   onBlockUser,
//   onReorderPlaylist,
//   onDeletePlaylistItem,
// }: RightSidebarProps) => {
//   return (
//     <div className="flex-grow flex flex-col bg-gray-800 min-h-0">
//       {selectedTab === "chat" ? (
//         <ChatPanel
//           messages={messages}
//           sendMessage={sendMessage}
//           onBlockUser={onBlockUser}
//           isHost={isHost}
//         />
//       ) : (
//         <PlaylistPanel
//           isHost={isHost}
//           playlist={playlist}
//           currentVideoIndex={currentVideoIndex}
//           onAddToPlaylist={onAddToPlaylist}
//           onSelect={onSelectPlaylistIndex}
//           onReorder={onReorderPlaylist}
//           onDeleteItem={onDeletePlaylistItem}
//         />
//       )}
//     </div>
//   );
// };

// export default RightSidebar;

// import ChatPanel from "./ChatPanel";
// import PlaylistPanel from "./PlaylistPanel";
// import type { ChatMessage } from "../../types/chat";
// import { ejectUserFromRoom } from "../../api/roomService";

// type RightSidebarProps = {
//   selectedTab: "chat" | "playlist";
//   isHost: boolean;
//   roomId: string | undefined;
//   messages: ChatMessage[];
//   sendMessage: (content: string) => void;
//   playlist: string[];
//   currentVideoIndex: number;
//   onAddToPlaylist: (videoId: string) => void;
//   onSelectPlaylistIndex?: (index: number) => void;
//   onBlockUser: (userId: string) => void;
//   onReorderPlaylist?: (from: number, to: number) => void;
//   onDeletePlaylistItem?: (index: number) => void;
//   /** ✅ 추가: 강퇴할 때 필요 */
//   artistId?: number;
// };

// const RightSidebar = ({
//   selectedTab,
//   isHost,
//   roomId,
//   messages,
//   sendMessage,
//   playlist,
//   currentVideoIndex,
//   onAddToPlaylist,
//   onSelectPlaylistIndex,
//   onBlockUser,
//   onReorderPlaylist,
//   onDeletePlaylistItem,
//   artistId,
// }: RightSidebarProps) => {
//   return (
//     <div className="flex-grow flex flex-col bg-gray-800 min-h-0">
//       {selectedTab === "chat" ? (
//         <ChatPanel
//           messages={messages}
//           sendMessage={sendMessage}
//           onBlockUser={onBlockUser}
//           isHost={isHost}
//           /** ✅ 방장이 채팅에서 '강퇴하기' 눌렀을 때 여기로 옴 */
//           onEjectUser={async (user) => {
//             if (!roomId || !artistId) return;
//             try {
//               await ejectUserFromRoom(Number(roomId), artistId, user.nickname);
//             } catch (e) {
//               console.error("강퇴 실패:", e);
//             }
//           }}
//         />
//       ) : (
//         <PlaylistPanel
//           isHost={isHost}
//           playlist={playlist}
//           currentVideoIndex={currentVideoIndex}
//           onAddToPlaylist={onAddToPlaylist}
//           onSelect={onSelectPlaylistIndex}
//           onReorder={onReorderPlaylist}
//           onDeleteItem={onDeletePlaylistItem}
//         />
//       )}
//     </div>
//   );
// };

// export default RightSidebar;

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
  onBlockUser: (userId: string) => void;
  onReorderPlaylist?: (from: number, to: number) => void;
  onDeletePlaylistItem?: (index: number) => void;
  /** ✅ 추가: 강퇴 콜백 */
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
          /** ✅ 여기서 ChatPanel로 넘김 */
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

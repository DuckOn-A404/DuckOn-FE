// RightSidebar.tsx
import ChatPanel from "./ChatPanel";
import PlaylistPanel from "./PlaylistPanel";

const RightSidebar = ({
  selectedTab,
  isHost,
  roomId,
}: {
  selectedTab: "chat" | "playlist";
  isHost: boolean;
  roomId: string | undefined;
}) => {
  return (
    <div className="flex-grow overflow-y-auto p-4">
      {selectedTab === "chat" ? (
        <ChatPanel roomId={roomId} />
      ) : (
        <PlaylistPanel isHost={isHost} />
      )}
    </div>
  );
};

export default RightSidebar;

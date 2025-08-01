// RightSidebar.tsx
import ChatPanel from "./ChatPanel";
import PlaylistPanel from "./PlaylistPanel";

const RightSidebar = ({
  selectedTab,
  isHost,
}: {
  selectedTab: "chat" | "playlist";
  isHost: boolean;
}) => {
  return (
    <div className="flex-grow overflow-y-auto p-4">
      {selectedTab === "chat" ? (
        <ChatPanel />
      ) : (
        <PlaylistPanel isHost={isHost} />
      )}
    </div>
  );
};

export default RightSidebar;

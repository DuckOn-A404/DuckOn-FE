// PlaylistPanel.tsx
import { useState } from "react";
import { Plus } from "lucide-react";

type PlaylistPanelProps = {
  isHost: boolean;
  playlist: string[];
  onAddToPlaylist: (videoId: string) => void;
};

const PlaylistPanel = ({
  isHost,
  playlist,
  onAddToPlaylist,
}: PlaylistPanelProps) => {
  const [inputId, setInputId] = useState("");

  return (
    <div className="flex flex-col h-full text-white">
      {/* 리스트 */}
      <div className="flex-1 space-y-2 overflow-y-auto pb-2">
        {playlist.map((videoId) => (
          <div
            key={videoId}
            className="p-3 rounded-md flex items-center justify-between bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            <div className="font-semibold truncate">{videoId}</div>
          </div>
        ))}
      </div>

      {/* 방장 전용 추가 UI */}
      {isHost && (
        <div className="mt-4 flex items-center gap-2">
          <input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="YouTube Video ID"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
          />
          <button
            onClick={() => {
              const v = inputId.trim();
              if (!v) return;
              onAddToPlaylist(v);
              setInputId("");
            }}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 px-3 rounded-md font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} />
            추가
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaylistPanel;

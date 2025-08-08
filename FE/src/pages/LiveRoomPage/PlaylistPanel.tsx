import { useState } from "react";
import { Plus } from "lucide-react";

type PlaylistPanelProps = {
  isHost: boolean;
  playlist: string[];
  currentVideoIndex: number;
  onAddToPlaylist: (videoId: string) => void;
};

const PlaylistPanel = ({
  isHost,
  playlist,
  currentVideoIndex,
  onAddToPlaylist,
}: PlaylistPanelProps) => {
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toVideoId = (value: string): string | null => {
    const trimmed = value.trim();

    // 유튜브 링크 패턴 매칭
    const regex =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = trimmed.match(regex);
    if (match && match[1]) return match[1];

    // 순수 11자 ID
    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

    return null;
  };

  const toThumbUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/default.jpg`;
  };

  const handleAdd = () => {
    setError(null);
    const id = toVideoId(inputId);
    if (!id) {
      setError("유효한 YouTube URL 또는 영상 ID가 아닙니다.");
      return;
    }
    if (playlist.includes(id)) {
      setError("이미 플레이리스트에 있는 영상입니다.");
      return;
    }
    onAddToPlaylist(id);
    setInputId("");
  };

  return (
    <div className="flex flex-col h-full text-white">
      {/* 리스트 */}
      <div className="flex-1 space-y-2 overflow-y-auto pb-2">
        {playlist.map((videoId, index) => {
          const isPlaying = index === currentVideoIndex;
          return (
            <div
              key={`${videoId}-${index}`}
              className={`p-3 rounded-md flex items-center justify-between transition-colors ${
                isPlaying
                  ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={toThumbUrl(videoId)}
                  alt="thumbnail"
                  className="w-12 h-8 object-cover rounded flex-shrink-0"
                />
                <span className="font-semibold truncate">{videoId}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 방장 전용 추가 UI */}
      {isHost && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="YouTube URL 또는 Video ID"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
            />
            <button
              onClick={handleAdd}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 px-3 rounded-md font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={16} />
              추가
            </button>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default PlaylistPanel;

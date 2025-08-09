import { useState } from "react";
import { Youtube } from "lucide-react";

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
    onAddToPlaylist(id);
    setInputId("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      {/* 리스트 */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        {playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Youtube size={48} />
            <p className="mt-2 text-sm">재생목록이 비었습니다.</p>
            {isHost && (
              <p className="text-xs">아래에서 영상을 추가해 주세요.</p>
            )}
          </div>
        ) : (
          playlist.map((videoId, index) => {
            const isPlaying = index === currentVideoIndex;
            return (
              <div
                key={`${videoId}-${index}`}
                className={`p-2 rounded-lg flex items-center justify-between transition-all duration-300 ease-in-out ${
                  isPlaying
                    ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-lg"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2/5 flex-shrink-0">
                    <img
                      src={toThumbUrl(videoId)}
                      alt="thumbnail"
                      className="w-full aspect-video object-cover rounded-md" // aspect-video 추가
                    />
                  </div>
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <span className="font-semibold truncate text-sm">
                      {`Video ID: ${videoId}`}
                    </span>
                    <span
                      className={`text-xs ${
                        isPlaying ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {isPlaying ? "지금 재생 중" : `재생목록 #${index + 1}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* 방장 전용 추가 UI */}
      {isHost && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="relative flex items-center">
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="영상 추가"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors pr-20"
            />
            <button
              onClick={handleAdd}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-3 rounded-md text-sm flex items-center gap-1"
            >
              추가
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default PlaylistPanel;

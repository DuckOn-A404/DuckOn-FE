import { useState } from "react";
import { Plus, XCircle } from "lucide-react";
import { extractVideoId } from "../../utils/youtubeUtils";

type PlaylistItem = {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  isPlaying: boolean;
};

type PlaylistPanelProps = {
  isHost: boolean;
};

const PlaylistPanel = ({ isHost }: PlaylistPanelProps) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAddVideo = () => {
    setError(null);
    const videoId = extractVideoId(urlInput);

    if (videoId) {
      // 성공: 유효한 링크
      const newItem: PlaylistItem = {
        videoId,
        title: `새로운 영상 (ID: ${videoId})`, // 실제로는 API로 제목을 가져와야 합니다.
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: "00:00", // 실제로는 API로 길이를 가져와야 합니다.
        isPlaying: false,
      };
      setPlaylist((prev) => [...prev, newItem]);
      setUrlInput("");
    } else {
      // 실패: 유효하지 않은 링크
      setError("유효하지 않은 YouTube 링크입니다.");
    }
  };

  return (
    <div className="p-4 h-full flex flex-col text-white">
      {isHost && (
        <div className="mb-4 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddVideo()}
              placeholder="YouTube 영상 링크 추가"
              className="w-full bg-gray-700 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAddVideo}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <XCircle size={14} /> {error}
            </p>
          )}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto">
        {playlist.length > 0 ? (
          playlist.map((item) => (
            <div
              key={item.videoId}
              className={`p-2 rounded-lg flex items-center gap-3 ${
                item.isPlaying
                  ? "bg-gradient-to-r from-pink-500 to-fuchsia-500"
                  : "bg-gray-700"
              }`}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-20 h-12 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                {item.isPlaying && (
                  <span className="text-xs mb-0.5 block text-white/90">
                    현재 재생 중
                  </span>
                )}
                <div className="font-semibold truncate text-sm">
                  {item.title}
                </div>
                <div className="text-xs opacity-80">{item.duration}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            <p>플레이리스트가 비어있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPanel;

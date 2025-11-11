// src/components/YouTubeSearchModal.tsx
import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

type YouTubeSearchModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (video: {
    videoId: string;
    url: string;
    title?: string;
    channel?: string;
    thumbnail?: string;
  }) => void;
};

const YouTubeSearchModal = ({ open, onClose, onSelect }: YouTubeSearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const YT_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!open) return null;

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!YT_KEY) {
      setError("YouTube API 키가 설정되지 않았습니다.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: YT_KEY,
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 12,
        },
      });
      setResults(res.data.items || []);
    } catch (e) {
      setError("검색 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    const id = item.id?.videoId;
    const sn = item.snippet;
    if (!id) return;
    onSelect({
      videoId: id,
      url: `https://www.youtube.com/watch?v=${id}`,
      title: sn.title,
      channel: sn.channelTitle,
      thumbnail: sn.thumbnails?.medium?.url,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex justify-end bg-black/30">
      <div className="h-full w-[360px] bg-slate-950 text-white flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <p className="text-sm font-semibold">YouTube 검색</p>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* 검색창 */}
        <div className="p-4">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/70"
              placeholder="영상 제목, 가수명..."
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm"
            >
              검색
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          {loading && <p className="text-xs text-slate-300 mt-2">검색 중...</p>}
        </div>

        {/* 결과 리스트 */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {results.map((item) => {
            const sn = item.snippet;
            const thumb = sn.thumbnails?.medium?.url;
            return (
              <button
                key={item.id.videoId}
                onClick={() => handleSelect(item)}
                className="w-full bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-xl overflow-hidden flex gap-3 p-2 text-left transition"
              >
                <div className="w-28 aspect-video bg-slate-700 rounded-lg overflow-hidden">
                  {thumb && <img src={thumb} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-xs font-semibold line-clamp-2">{sn.title}</p>
                  <p className="text-[10px] text-slate-400">{sn.channelTitle}</p>
                </div>
              </button>
            );
          })}
          {!loading && results.length === 0 && (
            <p className="text-xs text-slate-500 text-center mt-10">
              검색 결과가 여기 표시됩니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeSearchModal;

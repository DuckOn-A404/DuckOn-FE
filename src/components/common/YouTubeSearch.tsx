import { useState } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

type Props = {
  onSelect: (videoId: string, title: string, thumbnail: string) => void;
};

export default function YouTubeSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: API_KEY,
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 12,
        },
      });
      setResults(res.data.items || []);
    } catch (e) {
      console.error(e);
      setError("검색 중 오류가 발생했어요 😢");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="YouTube 영상 검색"
          className="border rounded px-3 py-2 w-full text-sm"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-sky-500 text-white rounded text-sm"
        >
          검색
        </button>
      </div>

      {loading && <p className="text-sm text-gray-400">검색 중...</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
        {results.map((item) => {
          const snippet = item.snippet;
          const videoId = item.id.videoId;
          const thumbnail = snippet.thumbnails?.medium?.url;

          return (
            <button
              key={videoId}
              onClick={() => onSelect(videoId, snippet.title, thumbnail)}
              className="text-left hover:bg-gray-50 rounded-lg p-1"
            >
              <img src={thumbnail} alt={snippet.title} className="rounded mb-1" />
              <p className="text-xs font-medium line-clamp-2">{snippet.title}</p>
              <p className="text-[10px] text-gray-400">{snippet.channelTitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

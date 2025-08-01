import { useState } from "react";

// Mock Data
const mockPlaylist = [
  {
    id: 1,
    title: "2024년 청룡영화제 응원 무대",
    duration: "03:30",
    isPlaying: true,
  },
  {
    id: 2,
    title: "20210819 레전드 인기가요",
    duration: "05:10",
    isPlaying: false,
  },
  {
    id: 3,
    title: "20230402 어떤 무대",
    duration: "04:23",
    isPlaying: false,
  },
  {
    id: 4,
    title: "무대어쩌구",
    duration: "14:23",
    isPlaying: false,
  },
  {
    id: 5,
    title: "저쩌구무대",
    duration: "14:23",
    isPlaying: false,
  },
];

// 1. 컴포넌트의 props 타입을 정의합니다.
type PlaylistPanelProps = {
  isHost: boolean;
};

const PlaylistPanel = ({ isHost }: PlaylistPanelProps) => {
  const [playlist, setPlaylist] = useState(mockPlaylist);

  return (
    <div className="flex flex-col h-full">
      {/* 리스트 영역 */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {playlist.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg ${
              item.isPlaying
                ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white"
                : "bg-gray-700 text-gray-100"
            }`}
          >
            {item.isPlaying && (
              <span className="text-sm mb-1 block text-white/90">
                현재 재생 중
              </span>
            )}
            <div className="font-semibold truncate">{item.title}</div>
            <div className="text-sm opacity-80">{item.duration}</div>
          </div>
        ))}
      </div>

      {/* '플레이 리스트 추가' 버튼 */}
      {isHost && (
        <button className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 rounded-xl font-semibold">
          플레이 리스트 추가
        </button>
      )}
    </div>
  );
};

export default PlaylistPanel;

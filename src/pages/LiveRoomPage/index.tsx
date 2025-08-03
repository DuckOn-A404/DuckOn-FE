import { useState } from "react";
import { useParams } from "react-router-dom";

// 1. 페이지를 구성하는 자식 컴포넌트들을 import 합니다.
import LiveHeader from "./LiveHeader";
import VideoPlayer from "./VideoPlayer";
import RightSidebar from "./RightSidebar";

const LiveRoomPage = () => {
  // 오른쪽 사이드바의 활성 탭 상태만 관리합니다.
  const [activeTab, setActiveTab] = useState<"chat" | "playlist">("chat");

  // 임의로
  const isHost = true;
  const { roomId } = useParams<{ roomId: string }>();

  return (
    // 전체 레이아웃
    <div className="flex h-screen bg-gray-900 text-white">
      {/* 왼쪽: 영상 및 헤더 영역 */}
      <main className="flex-1 flex flex-col">
        <LiveHeader />
        <VideoPlayer />
      </main>

      {/* 오른쪽: 사이드바 영역 */}
      <aside className="w-80 bg-gray-800 flex flex-col">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              activeTab === "chat"
                ? "text-white border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            실시간 채팅
          </button>
          <button
            onClick={() => setActiveTab("playlist")}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              activeTab === "playlist"
                ? "text-white border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            플레이리스트
          </button>
        </div>

        <RightSidebar selectedTab={activeTab} isHost={isHost} roomId={roomId} />
      </aside>
    </div>
  );
};

export default LiveRoomPage;

import { useState } from "react";

// 1. 페이지를 구성하는 자식 컴포넌트들을 import 합니다.
import LiveHeader from "./LiveHeader";
import VideoPlayer from "./VideoPlayer";
import ChatPanel from "./ChatPanel";
import PlaylistPanel from "./PlaylistPanel";

const LiveRoomPage = () => {
  // 오른쪽 사이드바의 활성 탭 상태만 관리합니다.
  const [activeTab, setActiveTab] = useState<"chat" | "playlist">("chat");

  // 데이터 로딩, 에러 처리 등 모든 API 관련 로직을 제거했습니다.

  return (
    // 전체 레이아웃
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* 상단 헤더 */}
      <LiveHeader />

      {/* 본문: 영상 + 사이드바 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽: 영상 */}
        <main className="flex-1 bg-black">
          <VideoPlayer />
        </main>

        {/* 오른쪽: 사이드바 */}
        <aside className="w-80 bg-gray-800 flex flex-col border-l border-gray-700">
          {/* 탭 버튼 */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${
                activeTab === "chat"
                  ? "text-white border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              실시간 채팅
            </button>
            <button
              onClick={() => setActiveTab("playlist")}
              className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${
                activeTab === "playlist"
                  ? "text-white border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              플레이리스트
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "chat" ? <ChatPanel /> : <PlaylistPanel />}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LiveRoomPage;

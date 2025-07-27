import { useState } from "react";
import ChatTab from "./ChatTab";
import RecommendTab from "./RecommendTab";

const RightSidebar = () => {
  const [selectedTab, setSelectedTab] = useState<"chat" | "recommend">("chat");

  return (
    <aside className="w-80 p-4 border-l border-gray-200 bg-white">
      {/* 탭 선택 */}
      <div className="flex border-b mb-4">
        <button
          className={`flex-1 text-sm font-semibold py-2 ${
            selectedTab === "chat"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-400"
          }`}
          onClick={() => setSelectedTab("chat")}
        >
          실시간 채팅
        </button>
        <button
          className={`flex-1 text-sm font-semibold py-2 ${
            selectedTab === "recommend"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-400"
          }`}
          onClick={() => setSelectedTab("recommend")}
        >
          추천
        </button>
      </div>

      {/* 탭 내용 */}
      {selectedTab === "chat" ? <ChatTab /> : <RecommendTab />}
    </aside>
  );
};

export default RightSidebar;

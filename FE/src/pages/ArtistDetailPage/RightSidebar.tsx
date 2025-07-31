import { useState } from "react";
import ChatTab from "./ChatTab";
import RecommendTab from "./RecommendTab";
import { Send } from "lucide-react";

const RightSidebar = () => {
  const [selectedTab, setSelectedTab] = useState<"chat" | "recommend">("chat");

  return (
    <aside className="w-80 p-4">
      {/* 탭 선택 */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col min-h-[calc(100vh-6rem)]">
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
        <div className="flex-grow overflow-y-hidden">
          {selectedTab === "chat" ? <ChatTab /> : <RecommendTab />}
        </div>

        {/* 3. 채팅 입력창 (채팅 탭일 때만 보임) */}
        {selectedTab === "chat" && (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex justify-center items-center">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;

import { useState, useRef } from "react";
import ArtistChatTab from "./ArtistChatTab";
import RecommendTab from "./RecommendTab";
import { Send } from "lucide-react";
import { useArtistChat } from "../../hooks/useArtistChat";
import { useUserStore } from "../../store/useUserStore";
import { useArtistFollowStore } from "../../store/useArtistFollowStore";

type RightSidebarProps = {
  artistId: number;
};

const RightSidebar = ({ artistId }: RightSidebarProps) => {
  const [selectedTab, setSelectedTab] = useState<"chat" | "recommend">("chat");

  // 아티스트 메시지 관련 변수
  const { messages, sendMessage } = useArtistChat(String(artistId));

  // 채팅 입력창 상태 관리
  const [newMessage, setNewMessage] = useState("");

  // 채팅 가능 여부 판단을 위해 유저 확인
  const { myUser } = useUserStore();
  const { isFollowing } = useArtistFollowStore();

  const scrollContainerRef = useRef<null | HTMLDivElement>(null);

  const isLoggedIn = !!myUser;
  const isUserFollowing = isFollowing.has(artistId);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <aside className="w-80 p-4">
      <div className="bg-white rounded-2xl shadow p-4 mb-2 flex flex-col h-[calc(100vh-6rem)]">
        {/* 탭 선택 */}
        <div className="flex-shrink-0 flex border-b border-gray-200">
          <button
            className={`flex-1 text-sm font-semibold py-2 -mb-[1px] ${
              selectedTab === "chat"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 border-b-2 border-transparent"
            }`}
            onClick={() => setSelectedTab("chat")}
          >
            실시간 채팅
          </button>
          <button
            className={`flex-1 text-sm font-semibold py-2 -mb-[1px] ${
              selectedTab === "recommend"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 border-b-2 border-transparent"
            }`}
            onClick={() => setSelectedTab("recommend")}
          >
            추천
          </button>
        </div>

        {/* 탭 내용 */}
        <div
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto min-h-0"
        >
          {selectedTab === "chat" ? (
            <ArtistChatTab
              messages={messages}
              scrollContainerRef={scrollContainerRef}
            />
          ) : (
            <RecommendTab />
          )}
        </div>

        {/* 채팅 입력창 (채팅 탭일 때만 보임) */}
        {selectedTab === "chat" && (
          <div className="flex-shrink-0">
            {/* 로그인했고, 팔로우 중일 때만 입력창을 표시합니다. */}
            {isLoggedIn && isUserFollowing ? (
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex justify-center items-center disabled:bg-gray-400"
                >
                  <Send size={18} />
                </button>
              </div>
            ) : (
              // 로그아웃 상태거나, 팔로우 중이 아닐 때 안내 메시지를 표시합니다.
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    {/* 잠금 아이콘으로 변경 */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      팔로우 전용 채팅
                    </p>
                    <p className="text-xs text-gray-500">
                      아티스트를 팔로우하고 대화에 참여하세요.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;

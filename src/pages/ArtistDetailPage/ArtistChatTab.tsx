import { useEffect, type RefObject } from "react";
import type { artistChatMessage } from "../../types/artistChat";
import { useUserStore } from "../../store/useUserStore";

type ChatTabProps = {
  messages: artistChatMessage[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

const ArtistChatTab = ({ messages, scrollContainerRef }: ChatTabProps) => {
  const { myUser } = useUserStore();

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, scrollContainerRef]);

  if (!Array.isArray(messages)) {
    console.error(
      "ArtistChatTab이 배열이 아닌 messages prop을 받았습니다:",
      messages
    );
    return (
      <div className="p-4 text-sm text-gray-500">채팅을 불러오는 중...</div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">아직 채팅 메시지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {messages.map((msg) => (
        <div
          key={msg.messageId}
          className={`flex items-start gap-3 ${
            msg.userId === myUser?.userId ? "justify-end" : "justify-start"
          }`}
        >
          {/* 이름과 말풍선 */}
          <div
            className={`flex flex-col ${
              msg.userId === myUser?.userId ? "items-end" : "items-start"
            }`}
          >
            <span className="text-sm font-semibold text-gray-700 mb-1">
              {msg.userNickname}
            </span>
            <div
              className={`px-4 py-2 rounded-xl max-w-xs break-words ${
                msg.userId === myUser?.userId
                  ? "bg-purple-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {new Date(msg.sentAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArtistChatTab;

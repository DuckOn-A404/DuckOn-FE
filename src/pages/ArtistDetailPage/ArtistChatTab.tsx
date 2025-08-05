import type { artistChatMessage } from "../../types/artistChat";
import { useUserStore } from "../../store/useUserStore";

type ChatTabProps = {
  messages: artistChatMessage[];
};

const ArtistChatTab = ({ messages }: ChatTabProps) => {
  const { myUser } = useUserStore();

  console.log("ArtistChatTab이 받은 messages:", messages);

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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-3">
        {messages.map((msg) => (
          <div
            key={msg.messageId}
            className={`flex items-start gap-3 ${
              msg.senderId === myUser?.userId ? "justify-end" : "justify-start"
            }`}
          >
            {/* 이름과 말풍선 */}
            <div
              className={`flex flex-col ${
                msg.senderId === myUser?.userId ? "items-end" : "items-start"
              }`}
            >
              <span className="text-sm font-semibold text-gray-700 mb-1">
                {msg.senderName}
              </span>
              <div
                className={`px-4 py-2 rounded-xl max-w-xs break-words ${
                  msg.senderId === myUser?.userId
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
    </div>
  );
};

export default ArtistChatTab;

import type { ChatMessage } from "../../types/artistChat";
import { useUserStore } from "../../store/useUserStore"; // 현재 유저 정보를 가져오기 위함

type ChatTabProps = {
  messages: ChatMessage[];
};

const ArtistChatTab = ({ messages }: ChatTabProps) => {
  const { myUser } = useUserStore(); // 내 아이디를 가져와서 내 메시지인지 구분

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
                {new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
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

import { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, UserX } from "lucide-react";
import { Popover } from "@headlessui/react";
import { useUserStore } from "../../store/useUserStore";
import type { ChatMessage } from "../../types/chat";

type ChatPanelProps = {
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
};

const ChatPanel = ({ messages, sendMessage }: ChatPanelProps) => {
  const { myUser } = useUserStore();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBlock = (senderId: string) =>
    alert(`${senderId}님을 차단합니다.`);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full text-white">
      {/* 메시지 목록 영역 */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((msg) => {
          if (msg.chatType === "ENTER") {
            return (
              <div
                key={msg.messageId}
                className="text-center text-xs text-gray-400 py-1"
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.messageId}
              className={`flex flex-col ${
                msg.senderId === myUser?.userId ? "items-end" : "items-start"
              }`}
            >
              {msg.senderId !== myUser?.userId && (
                <span className="text-xs text-gray-400 mb-1">
                  {msg.senderName}
                </span>
              )}

              <div
                className={`flex items-end gap-2 max-w-[85%] ${
                  msg.senderId === myUser?.userId ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`relative group px-3 py-2 rounded-lg break-words ${
                    msg.senderId === myUser?.userId
                      ? "bg-purple-600 rounded-br-none"
                      : "bg-gray-700 rounded-bl-none"
                  }`}
                >
                  <span>{msg.content}</span>

                  {msg.senderId !== myUser?.userId && (
                    <Popover>
                      <Popover.Button className="absolute top-1 right-1 p-0.5 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100">
                        <MoreVertical size={14} />
                      </Popover.Button>

                      <Popover.Panel className="absolute z-10 bottom-full right-0 mb-2 w-36 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
                        <div className="flex flex-col p-1">
                          <button
                            onClick={() => handleBlock(msg.senderId)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
                          >
                            <UserX size={14} />
                            <span>차단하기</span>
                          </button>
                        </div>
                      </Popover.Panel>
                    </Popover>
                  )}
                </div>

                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 메시지 입력 영역 */}
      <div className="py-2 border-t border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
            className="w-full bg-gray-600 text-white rounded-lg py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-500"
            disabled={!newMessage.trim()}
            onClick={handleSendMessage}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
            className="w-full bg-gray-600 text-white rounded-lg py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-500"
            disabled={!newMessage.trim()}
            onClick={handleSendMessage}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;

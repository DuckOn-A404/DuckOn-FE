import { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, UserX, LockKeyhole } from "lucide-react";
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
    <div className="flex flex-col h-full min-h-0 bg-gray-800 text-white">
      {/* 메시지 목록 영역 */}
      {/* <div className="flex-1 space-y-4 overflow-y-auto p-4"> */}
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">  
        {messages.map((msg, index) => {
          if (msg.chatType === "ENTER") {
            return (
              <div
                key={`system-${index}`}
                className="text-center text-xs text-gray-500 py-1"
              >
                {msg.content}
              </div>
            );
          }

          const uniqueKey = `${msg.senderId}-${msg.sentAt || index}`;
          const isMyMessage = msg.senderId === myUser?.userId;

          return (
            <div
              key={uniqueKey}
              className={`flex flex-col ${
                isMyMessage ? "items-end" : "items-start"
              }`}
            >
              <span className="text-xs text-gray-500 mb-1">
                {msg.senderNickName}
              </span>

              <div
                className={`flex items-end gap-2 max-w-[85%] ${
                  isMyMessage ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg text-sm ${
                    isMyMessage ? "bg-purple-600" : "bg-gray-700"
                  } break-all`}
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
                  {new Date(msg.sentAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* 메시지 입력 영역 */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/80 flex-shrink-0">
        {myUser ? (
          <div className="relative flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="메시지를 입력하세요..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors pr-12"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        ) : (
          // ======================== 로그아웃 상태일 때: 안내 메시지 표시 ========================
          <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4 mx-2">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-800">
                <LockKeyhole className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  로그인 후 채팅 가능
                </p>
                <p className="text-xs text-gray-400">
                  로그인하고 대화에 참여하세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;

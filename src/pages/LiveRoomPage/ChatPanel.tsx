import { useState } from "react";
import { Send, MoreVertical, ShieldAlert, UserX } from "lucide-react";
import { Popover } from "@headlessui/react";

// 현재 사용자와 채팅 메시지에 대한 임의의(목업) 데이터를 생성합니다.
const currentUser = {
  id: "me", // 현재 사용자를 식별하기 위한 고유 ID
};

const mockMessages = [
  {
    id: 1,
    senderId: "club_admin",
    sender: "먼지관람클럽",
    text: "드디어 시작이다! 🪁",
    timestamp: "14:23",
  },
  {
    id: 2,
    senderId: "lover123",
    sender: "NewJeansLover",
    text: "이 부분 너무 좋아 ㅠㅠ",
    timestamp: "14:24",
  },
  {
    id: 3,
    senderId: "me",
    sender: "Me",
    text: "같이 보니까 더 재밌네요!",
    timestamp: "14:24",
  },
  {
    id: 4,
    senderId: "fanboy4",
    sender: "다니엘최고",
    text: "화질 좋다 👍",
    timestamp: "14:25",
  },
  {
    id: 5,
    senderId: "rapper_h",
    sender: "혜인덕후",
    text: "채팅 속도 미쳐...",
    timestamp: "14:25",
  },
];

const ChatPanel = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleReport = (senderId: string) =>
    alert(`${senderId}님을 신고합니다.`);
  const handleBlock = (senderId: string) =>
    alert(`${senderId}님을 차단합니다.`);

  return (
    <div className="flex flex-col h-full text-white">
      {/* 메시지 목록 영역 */}
      <div className="flex-1 space-y-4 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.senderId === currentUser.id ? "items-end" : "items-start"
            }`}
          >
            {msg.senderId !== currentUser.id && (
              <span className="text-xs text-gray-400 mb-1">{msg.sender}</span>
            )}

            <div
              className={`flex items-end gap-2 max-w-[85%] ${
                msg.senderId === currentUser.id ? "flex-row-reverse" : ""
              }`}
            >
              <div
                // 1. 말풍선을 기준점(relative) 및 호버 그룹(group)으로 만듭니다.
                className={`relative group px-3 py-2 rounded-lg break-words ${
                  msg.senderId === currentUser.id
                    ? "bg-purple-600 rounded-br-none"
                    : "bg-gray-700 rounded-bl-none"
                }`}
              >
                {/* 메시지 텍스트 */}
                <span>{msg.text}</span>

                {/* 2. Popover 컴포넌트를 말풍선 div 안으로 이동시킵니다. */}
                {msg.senderId !== currentUser.id && (
                  <Popover>
                    {/* 3. 버튼을 절대 위치(absolute)로 오른쪽 위에 배치합니다. */}
                    {/* 평소엔 투명했다가, group(말풍선)에 호버하면 나타납니다. */}
                    <Popover.Button className="absolute top-1 right-1 p-0.5 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100">
                      <MoreVertical size={14} />
                    </Popover.Button>

                    <Popover.Panel className="absolute z-10 bottom-full right-0 mb-2 w-36 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
                      <div className="flex flex-col p-1">
                        <button
                          onClick={() => handleReport(msg.senderId)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
                        >
                          <ShieldAlert size={14} />
                          <span>신고하기</span>
                        </button>
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
              {/* ▲▲▲ 여기까지 수정되었습니다 ▲▲▲ */}

              <span className="text-xs text-gray-500 whitespace-nowrap">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 메시지 입력 영역 */}
      <div className="p-4 border-t border-gray-700">{/* ... */}</div>
    </div>
  );
};

export default ChatPanel;

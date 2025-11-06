import { useEffect, useMemo, useState, type RefObject } from "react";
import type { artistChatMessage } from "../../types/artistChat";
import { useUserStore } from "../../store/useUserStore";
import { Popover } from "@headlessui/react";
import { MoreVertical, UserX } from "lucide-react";
import { blockUser, getBlockedUsers } from "../../api/userService";
import ConfirmModal from "../../components/common/modal/ConfirmModal";
import NicknameWithRank from "../../components/common/NicknameWithRank";

type ChatTabProps = {
  messages: artistChatMessage[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

const ArtistChatTab = ({ messages, scrollContainerRef }: ChatTabProps) => {
  const { myUser } = useUserStore();
  const blockedSet = useUserStore((s) => s.blockedSet);
  const setBlockedList = useUserStore((s) => s.setBlockedList);
  const blockLocal = useUserStore((s) => s.blockLocal);

  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    description: "",
  });

  // 초기 동기화 (비어있으면 한 번만)
  useEffect(() => {
    (async () => {
      if (!myUser) return;
      if (blockedSet.size > 0) return;
      try {
        const list = await getBlockedUsers();
        setBlockedList(list.map((d) => d.userId));
      } catch {
        // ignore
      }
    })();
  }, [myUser, blockedSet.size, setBlockedList]);

  // 차단 기준으로 필터링
  const visibleMessages = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    return messages.filter((m) => !blockedSet.has(m.userId));
  }, [messages, blockedSet]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [visibleMessages, scrollContainerRef]);

  const handleBlock = async (userId: string, userNickname: string) => {
    try {
      await blockUser(userId);
      blockLocal(userId);
      setModalInfo({
        isOpen: true,
        title: "차단 완료",
        description: `${userNickname}님을 차단했습니다.`,
      });
    } catch {
      setModalInfo({
        isOpen: true,
        title: "오류",
        description: "차단 요청에 실패했습니다. 다시 시도해주세요.",
      });
    }
  };

  if (!Array.isArray(messages)) {
    return (
      <div className="p-4 text-sm text-gray-500">채팅을 불러오는 중...</div>
    );
  }

  if (visibleMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">아직 채팅 메시지가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 p-1">
        {visibleMessages.map((msg, index) => {
          // 현재 메시지 날짜 (YYYY년 M월 D일)
          const currentDate = new Date(msg.sentAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const prevMsg = index > 0 ? visibleMessages[index - 1] : null;

          // 바로 이전 메시지의 날짜
          const prevDate = prevMsg
          ? new Date(prevMsg.sentAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null;

          const showDateHeader = currentDate !== prevDate;

          // 같은 사용자가 같은 날짜에 연속으로 보냈는지
          const isSameUser =
            prevMsg &&
            prevMsg.userId === msg.userId &&
            currentDate === prevDate;

          // 자신이 보낸 메시지 여부
          const isMyMessage = msg.userId === myUser?.userId; 

          return (
            <div key={msg.messageId}>
             {showDateHeader && (
                <div className="flex justify-center my-2">
                  <div className="flex items-center gap-2 rounded-full bg-gray-200/80 px-3 py-1.5 text-xs text-gray-600">
                    {/* 달력 아이콘 */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>

                    <span>{currentDate}</span>
                  </div>
                </div>
              )}

              {/* 메시지 */}
              <div
                key={msg.messageId}
                className={`flex items-start gap-2 ${
                  isMyMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex flex-col ${
                    isMyMessage ? "items-end" : "items-start"
                  }`}
                >
                  { (
                    <span className="text-sm font-semibold text-gray-700 mb-1 mt-1">
                      <NicknameWithRank
                        nickname={msg.userNickname}
                        rankLevel={msg.userRank?.rankLevel ?? "GREEN"}
                        badgeSize={18}
                      />
                    </span>
                  )}
                  
                  {/* {!isSameUser && (
                    <span className="text-sm font-semibold text-gray-700 mb-1 mt-1">
                      {msg.userNickname}
                    </span>
                  )} */}

                <div className={`flex items-end gap-2 ${isSameUser ? "mt-0.5" : "mt-1"}`}>

                {isMyMessage ? (
                  <>
                    <span className="text-xs text-gray-400 self-end">
                      {new Date(msg.sentAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="relative group px-4 py-2 rounded-xl max-w-xs break-words bg-purple-600 text-white rounded-br-none">
                      <span>{msg.content}</span>
                    </div>
                  </>
                  ) : (
                    <>
                      <div className="relative group px-4 py-2 rounded-xl max-w-xs break-words bg-gray-200 text-gray-800 rounded-bl-none">
                        <span>{msg.content}</span>
                        <Popover className="absolute top-0 right-0">
                          <Popover.Button className="p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100 hover:bg-black/10">
                            <MoreVertical size={16} />
                          </Popover.Button>
                          <Popover.Panel className="absolute z-10 top-0 left-full ml-1 w-32 bg-white border rounded-lg shadow-lg">
                            <div className="p-1">
                              <button
                                onClick={() =>
                                  handleBlock(msg.userId, msg.userNickname)
                                }
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md"
                              >
                                <UserX size={14} />
                                <span>차단하기</span>
                              </button>
                            </div>
                          </Popover.Panel>
                        </Popover>
                      </div>
                      <span className="text-xs text-gray-400 self-end">
                        {new Date(msg.sentAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </>
                  )}
                </div>
               </div>
            </div>
          </div>
        )})}
      </div>

      <ConfirmModal
        isOpen={modalInfo.isOpen}
        title={modalInfo.title}
        description={modalInfo.description}
        confirmText="확인"
        onConfirm={() => setModalInfo({ ...modalInfo, isOpen: false })}
        onCancel={() => setModalInfo({ ...modalInfo, isOpen: false })}
      />
    </>
  );
};

export default ArtistChatTab;

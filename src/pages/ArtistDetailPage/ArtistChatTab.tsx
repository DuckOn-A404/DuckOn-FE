// import { useEffect, useMemo, useState, type RefObject } from "react";
// import type { artistChatMessage } from "../../types/artistChat";
// import { useUserStore } from "../../store/useUserStore";
// import { Popover } from "@headlessui/react";
// import { MoreVertical, UserX } from "lucide-react";
// import { blockUser } from "../../api/userService";
// import ConfirmModal from "../../components/common/modal/ConfirmModal";
// // import NicknameWithRank from "../../components/common/NicknameWithRank";

// type ChatTabProps = {
//   messages: artistChatMessage[];
//   scrollContainerRef: RefObject<HTMLDivElement | null>;
// };

// const ArtistChatTab = ({ messages, scrollContainerRef }: ChatTabProps) => {
//   const myUser = useUserStore((s) => s.myUser);
//   const blockedSet = useUserStore((s) => s.blockedSet);
//   const blockLocal = useUserStore((s) => s.blockLocal);
//   const refreshBlockedList = useUserStore((s) => s.refreshBlockedList);

//   const [modalInfo, setModalInfo] = useState({
//     isOpen: false,
//     title: "",
//     description: "",
//   });

//   // 초기 동기화: 로컬이 비어있고 로그인 상태면 서버에서 차단 목록 한 번만 불러옴
//   useEffect(() => {
//     (async () => {
//       if (!myUser) return;
//       if (blockedSet.size > 0) return;
//       try {
//         await refreshBlockedList();
//       } catch {
//         // ignore
//       }
//     })();
//   }, [myUser, blockedSet.size, refreshBlockedList]);

//   // 차단 기준으로 필터링
//   const visibleMessages = useMemo(() => {
//     if (!Array.isArray(messages)) return [];
//     return messages.filter((m) => !blockedSet.has(String(m.userId)));
//   }, [messages, blockedSet]);

//   // 보이는 메시지가 변할 때 스크롤 맨 아래로
//   useEffect(() => {
//     const el = scrollContainerRef.current;
//     if (!el) return;
//     el.scrollTo({
//       top: el.scrollHeight,
//       behavior: "smooth",
//     });
//   }, [visibleMessages, scrollContainerRef]);

//   // 차단 처리: 서버 반영 → 로컬 즉시 반영 → 서버 목록 재동기화(fire-and-forget)
//   const handleBlock = async (userId: string, userNickname: string) => {
//     try {
//       await blockUser(userId);      // 서버 반영
//       blockLocal(userId);           // UI 즉시 반영
//       refreshBlockedList().catch(() => {}); // 최신화 시도(실패해도 UI 유지)
//       setModalInfo({
//         isOpen: true,
//         title: "차단 완료",
//         description: `${userNickname}님을 차단했습니다.`,
//       });
//     } catch {
//       setModalInfo({
//         isOpen: true,
//         title: "오류",
//         description: "차단 요청에 실패했습니다. 다시 시도해주세요.",
//       });
//     }
//   };

//   if (!Array.isArray(messages)) {
//     return (
//       <div className="p-4 text-sm text-gray-500">채팅을 불러오는 중...</div>
//     );
//   }

//   if (visibleMessages.length === 0) {
//     return (
//       <>
//         <div className="flex items-center justify-center h-full">
//           <p className="text-sm text-gray-400">아직 채팅 메시지가 없습니다.</p>
//         </div>

//         <ConfirmModal
//           isOpen={modalInfo.isOpen}
//           title={modalInfo.title}
//           description={modalInfo.description}
//           confirmText="확인"
//           onConfirm={() => setModalInfo({ ...modalInfo, isOpen: false })}
//           onCancel={() => setModalInfo({ ...modalInfo, isOpen: false })}
//         />
//       </>
//     );
//   }

//   return (
//     <>
//       <div className="space-y-2 p-1">
//         {visibleMessages.map((msg, index) => {
//           // 현재 메시지 날짜 (YYYY년 M월 D일)
//           const currentDate = new Date(msg.sentAt).toLocaleDateString("ko-KR", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           });

//           const prevMsg = index > 0 ? visibleMessages[index - 1] : null;

//           // 바로 이전 메시지의 날짜
//           const prevDate = prevMsg
//             ? new Date(prevMsg.sentAt).toLocaleDateString("ko-KR", {
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//               })
//             : null;

//           const showDateHeader = currentDate !== prevDate;

//           // 같은 사용자가 같은 날짜에 연속으로 보냈는지
//           const isSameUser =
//             !!prevMsg &&
//             prevMsg.userId === msg.userId &&
//             currentDate === prevDate;

//           // 자신이 보낸 메시지 여부
//           const isMyMessage = msg.userId === myUser?.userId;

//           return (
//             <div key={msg.messageId}>
//               {showDateHeader && (
//                 <div className="flex justify-center my-2">
//                   <div className="flex items-center gap-2 rounded-full bg-gray-200/80 px-3 py-1.5 text-xs text-gray-600">
//                     {/* 달력 아이콘 */}
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="14"
//                       height="14"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="text-gray-500"
//                     >
//                       <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
//                       <line x1="16" y1="2" x2="16" y2="6" />
//                       <line x1="8" y1="2" x2="8" y2="6" />
//                       <line x1="3" y1="10" x2="21" y2="10" />
//                     </svg>

//                     <span>{currentDate}</span>
//                   </div>
//                 </div>
//               )}

//               {/* 메시지 */}
//               <div
//                 className={`flex items-start gap-2 ${
//                   isMyMessage ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`flex flex-col ${
//                     isMyMessage ? "items-end" : "items-start"
//                   }`}
//                 >
//                   {/* 같은 사용자가 연속인 경우에도 닉네임 노출 유지 (디자인 의도에 맞게 조절) */}
//                   <span className="text-sm font-semibold text-gray-700 mb-1 mt-1">
//                     {msg.userNickname}
//                   </span>

//                   <div
//                     className={`flex items-end gap-2 ${
//                       isSameUser ? "mt-0.5" : "mt-1"
//                     }`}
//                   >
//                     {isMyMessage ? (
//                       <>
//                         <span className="text-xs text-gray-400 self-end">
//                           {new Date(msg.sentAt).toLocaleTimeString(undefined, {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </span>
//                         <div className="relative group px-4 py-2 rounded-xl max-w-xs break-words bg-purple-600 text-white rounded-br-none">
//                           <span>{msg.content}</span>
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <div className="relative group px-4 py-2 rounded-xl max-w-xs break-words bg-gray-200 text-gray-800 rounded-bl-none">
//                           <span>{msg.content}</span>

//                           {/* 로그인 상태에서만 차단 메뉴 노출 + 자기 자신은 차단 버튼 숨김 */}
//                           {!!myUser && myUser.userId !== msg.userId && (
//                             <Popover className="absolute top-0 right-0">
//                               <Popover.Button className="p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100 hover:bg-black/10">
//                                 <MoreVertical size={16} />
//                               </Popover.Button>
//                               <Popover.Panel className="absolute z-10 top-0 left-full ml-1 w-32 bg-white border rounded-lg shadow-lg">
//                                 <div className="p-1">
//                                   <button
//                                     onClick={() =>
//                                       handleBlock(msg.userId, msg.userNickname)
//                                     }
//                                     className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md"
//                                   >
//                                     <UserX size={14} />
//                                     <span>차단하기</span>
//                                   </button>
//                                 </div>
//                               </Popover.Panel>
//                             </Popover>
//                           )}
//                         </div>

//                         <span className="text-xs text-gray-400 self-end">
//                           {new Date(msg.sentAt).toLocaleTimeString(undefined, {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <ConfirmModal
//         isOpen={modalInfo.isOpen}
//         title={modalInfo.title}
//         description={modalInfo.description}
//         confirmText="확인"
//         onConfirm={() => setModalInfo({ ...modalInfo, isOpen: false })}
//         onCancel={() => setModalInfo({ ...modalInfo, isOpen: false })}
//       />
//     </>
//   );
// };

// export default ArtistChatTab;

// import { useEffect, useMemo, useState, type RefObject } from "react";
// import type { artistChatMessage } from "../../types/artistChat";
// import { useUserStore } from "../../store/useUserStore";
// import { Popover } from "@headlessui/react";
// import { MoreVertical, UserX, AlertTriangle } from "lucide-react";
// import { blockUser } from "../../api/userService";
// import ConfirmModal from "../../components/common/modal/ConfirmModal";
// // import NicknameWithRank from "../../components/common/NicknameWithRank";

// type ChatTabProps = {
//   messages: artistChatMessage[];
//   scrollContainerRef: RefObject<HTMLDivElement | null>;
// };

// const ArtistChatTab = ({ messages, scrollContainerRef }: ChatTabProps) => {
//   const myUser = useUserStore((s) => s.myUser);
//   const blockedSet = useUserStore((s) => s.blockedSet);
//   const blockLocal = useUserStore((s) => s.blockLocal);
//   const refreshBlockedList = useUserStore((s) => s.refreshBlockedList);

//   const [modalInfo, setModalInfo] = useState({
//     isOpen: false,
//     title: "",
//     description: "",
//   });

//   // ✅ 신고 모달 상태 (프론트 전용)
//   const [reportTarget, setReportTarget] = useState<{
//     id: string;
//     nickname: string;
//   } | null>(null);
//   const [reportReason, setReportReason] = useState("");
//   const [reportDone, setReportDone] = useState(false);

//   // 초기 동기화: 로컬이 비어있고 로그인 상태면 서버에서 차단 목록 한 번만 불러옴
//   useEffect(() => {
//     (async () => {
//       if (!myUser) return;
//       if (blockedSet.size > 0) return;
//       try {
//         await refreshBlockedList();
//       } catch {
//         // ignore
//       }
//     })();
//   }, [myUser, blockedSet.size, refreshBlockedList]);

//   // 차단 기준으로 필터링
//   const visibleMessages = useMemo(() => {
//     if (!Array.isArray(messages)) return [];
//     return messages.filter((m) => !blockedSet.has(String(m.userId)));
//   }, [messages, blockedSet]);

//   // 보이는 메시지가 변할 때 스크롤 맨 아래로
//   useEffect(() => {
//     const el = scrollContainerRef.current;
//     if (!el) return;
//     el.scrollTo({
//       top: el.scrollHeight,
//       behavior: "smooth",
//     });
//   }, [visibleMessages, scrollContainerRef]);

//   // 차단 처리: 서버 반영 → 로컬 즉시 반영 → 서버 목록 재동기화(fire-and-forget)
//   const handleBlock = async (userId: string, userNickname: string) => {
//     try {
//       await blockUser(userId); // 서버 반영
//       blockLocal(userId); // UI 즉시 반영
//       refreshBlockedList().catch(() => {}); // 최신화 시도(실패해도 UI 유지)
//       setModalInfo({
//         isOpen: true,
//         title: "차단 완료",
//         description: `${userNickname}님을 차단했습니다.`,
//       });
//     } catch {
//       setModalInfo({
//         isOpen: true,
//         title: "오류",
//         description: "차단 요청에 실패했습니다. 다시 시도해주세요.",
//       });
//     }
//   };

//   // ✅ 신고 모달 열기
//   const openReportModal = (userId: string, userNickname: string) => {
//     setReportTarget({ id: userId, nickname: userNickname });
//     setReportReason("");
//     setReportDone(false);
//   };

//   // ✅ 신고 모달 닫기
//   const closeReportModal = () => {
//     setReportTarget(null);
//     setReportReason("");
//     setReportDone(false);
//   };

//   // ✅ 신고 제출 (프론트에서만 사용)
//   const handleSubmitReport = () => {
//     if (!reportTarget || !reportReason.trim()) return;

//     // 백엔드 전송 없이 콘솔에만 로그 남김
//     console.log("Artist chat report:", {
//       targetId: reportTarget.id,
//       targetNickname: reportTarget.nickname,
//       reason: reportReason,
//     });

//     setReportDone(true);
//   };

//   if (!Array.isArray(messages)) {
//     return (
//       <div className="p-4 text-sm text-gray-500">채팅을 불러오는 중...</div>
//     );
//   }

//   if (visibleMessages.length === 0) {
//     return (
//       <>
//         <div className="flex items-center justify-center h-full">
//           <p className="text-sm text-gray-400">아직 채팅 메시지가 없습니다.</p>
//         </div>

//         <ConfirmModal
//           isOpen={modalInfo.isOpen}
//           title={modalInfo.title}
//           description={modalInfo.description}
//           confirmText="확인"
//           onConfirm={() => setModalInfo({ ...modalInfo, isOpen: false })}
//           onCancel={() => setModalInfo({ ...modalInfo, isOpen: false })}
//         />
//       </>
//     );
//   }

//   return (
//     <>
//       {/* ✅ 신고 모달 (AlertTriangle 포함 / 프론트 전용) */}
//       {reportTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="w-11/12 max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 p-5 text-gray-900">
//             <div className="flex items-center gap-2 mb-3">
//               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
//                 <AlertTriangle className="w-4 h-4 text-red-500" />
//               </div>
//               <div>
//                 <h2 className="text-sm font-semibold">
//                   {reportTarget.nickname} 님 신고하기
//                 </h2>
//                 <p className="text-[11px] text-gray-500">
//                   부적절한 채팅이나 불쾌한 행동이 있었다면 신고 사유를
//                   작성해주세요.
//                 </p>
//               </div>
//             </div>

//             <textarea
//               className="w-full h-28 resize-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
//               placeholder="예) 욕설 및 비방, 불쾌한 채팅, 스팸 메시지 등"
//               value={reportReason}
//               onChange={(e) => setReportReason(e.target.value)}
//             />

//             {reportDone && (
//               <p className="mt-2 text-[11px] text-emerald-500">
//                 신고되었습니다. 빠른 시일 내로 조치를 취하겠습니다.
//               </p>
//             )}

//             <div className="mt-4 flex justify-end gap-2 text-xs">
//               <button
//                 type="button"
//                 onClick={closeReportModal}
//                 className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
//               >
//                 닫기
//               </button>
//               <button
//                 type="button"
//                 disabled={!reportReason.trim() || reportDone}
//                 onClick={handleSubmitReport}
//                 className={`px-3 py-1.5 rounded-lg font-semibold ${
//                   !reportReason.trim() || reportDone
//                     ? "bg-red-300 text-white cursor-not-allowed"
//                     : "bg-red-500 text-white hover:bg-red-600"
//                 }`}
//               >
//                 {reportDone ? "신고 완료" : "신고하기"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="space-y-2 p-1">
//         {visibleMessages.map((msg, index) => {
//           // 현재 메시지 날짜 (YYYY년 M월 D일)
//           const currentDate = new Date(msg.sentAt).toLocaleDateString("ko-KR", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           });

//           const prevMsg = index > 0 ? visibleMessages[index - 1] : null;

//           // 바로 이전 메시지의 날짜
//           const prevDate = prevMsg
//             ? new Date(prevMsg.sentAt).toLocaleDateString("ko-KR", {
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//               })
//             : null;

//           const showDateHeader = currentDate !== prevDate;

//           // 같은 사용자가 같은 날짜에 연속으로 보냈는지
//           const isSameUser =
//             !!prevMsg &&
//             prevMsg.userId === msg.userId &&
//             currentDate === prevDate;

//           // 자신이 보낸 메시지 여부
//           const isMyMessage = msg.userId === myUser?.userId;

//           return (
//             <div key={msg.messageId}>
//               {showDateHeader && (
//                 <div className="flex justify-center my-2">
//                   <div className="flex items-center gap-2 rounded-full bg-gray-200/80 px-3 py-1.5 text-xs text-gray-600">
//                     {/* 달력 아이콘 */}
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="14"
//                       height="14"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="text-gray-500"
//                     >
//                       <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
//                       <line x1="16" y1="2" x2="16" y2="6" />
//                       <line x1="8" y1="2" x2="8" y2="6" />
//                       <line x1="3" y1="10" x2="21" y2="10" />
//                     </svg>

//                     <span>{currentDate}</span>
//                   </div>
//                 </div>
//               )}

//               {/* 메시지 */}
//               <div
//                 className={`flex items-start gap-2 ${
//                   isMyMessage ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`flex flex-col ${
//                     isMyMessage ? "items-end" : "items-start"
//                   }`}
//                 >
//                   {/* 같은 사용자가 연속인 경우에도 닉네임 노출 유지 */}
//                   <span className="text-sm font-semibold text-gray-700 mb-1 mt-1">
//                     {msg.userNickname}
//                   </span>

//                   <div
//                     className={`flex items-end gap-2 ${
//                       isSameUser ? "mt-0.5" : "mt-1"
//                     }`}
//                   >
//                     {isMyMessage ? (
//                       <>
//                         <span className="text-xs text-gray-400 self-end">
//                           {new Date(msg.sentAt).toLocaleTimeString(undefined, {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </span>
//                         <div className="relative group px-4 py-2 rounded-xl max-w-xs break-words bg-purple-600 text-white rounded-br-none">
//                           <span>{msg.content}</span>
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <div className="relative group px-4 py-2 rounded-xl max-w-xs break-words bg-gray-200 text-gray-800 rounded-bl-none">
//                           <span>{msg.content}</span>

//                           {/* 로그인 상태에서만 메뉴 노출 + 자기 자신은 숨김 */}
//                           {!!myUser && myUser.userId !== msg.userId && (
//                             <Popover className="absolute top-0 right-0">
//                               <Popover.Button className="p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100 hover:bg-black/10">
//                                 <MoreVertical size={16} />
//                               </Popover.Button>
//                               <Popover.Panel className="absolute z-10 top-0 left-full ml-1 w-36 bg-white border rounded-lg shadow-lg">
//                                 <div className="p-1 flex flex-col gap-1">
//                                   {/* ✅ 신고하기 (프론트 전용) */}
//                                   <button
//                                     onClick={() =>
//                                       openReportModal(
//                                         msg.userId,
//                                         msg.userNickname
//                                       )
//                                     }
//                                     className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-red-500 hover:bg-red-50 rounded-md"
//                                   >
//                                     <AlertTriangle size={14} />
//                                     <span>신고하기</span>
//                                   </button>

//                                   {/* 차단하기 */}
//                                   <button
//                                     onClick={() =>
//                                       handleBlock(
//                                         msg.userId,
//                                         msg.userNickname
//                                       )
//                                     }
//                                     className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md"
//                                   >
//                                     <UserX size={14} />
//                                     <span>차단하기</span>
//                                   </button>
//                                 </div>
//                               </Popover.Panel>
//                             </Popover>
//                           )}
//                         </div>

//                         <span className="text-xs text-gray-400 self-end">
//                           {new Date(msg.sentAt).toLocaleTimeString(undefined, {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <ConfirmModal
//         isOpen={modalInfo.isOpen}
//         title={modalInfo.title}
//         description={modalInfo.description}
//         confirmText="확인"
//         onConfirm={() => setModalInfo({ ...modalInfo, isOpen: false })}
//         onCancel={() => setModalInfo({ ...modalInfo, isOpen: false })}
//       />
//     </>
//   );
// };

// export default ArtistChatTab;

import { useEffect, useMemo, useState, type RefObject } from "react";
import type { artistChatMessage } from "../../types/artistChat";
import { useUserStore } from "../../store/useUserStore";
import { Popover } from "@headlessui/react";
import { MoreVertical, UserX, AlertTriangle } from "lucide-react";
import { blockUser } from "../../api/userService";
import ConfirmModal from "../../components/common/modal/ConfirmModal";
import { useUiTranslate } from "../../hooks/useUiTranslate";
// import NicknameWithRank from "../../components/common/NicknameWithRank";

type ChatTabProps = {
  messages: artistChatMessage[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

const ArtistChatTab = ({ messages, scrollContainerRef }: ChatTabProps) => {
  const myUser = useUserStore((s) => s.myUser);
  const blockedSet = useUserStore((s) => s.blockedSet);
  const blockLocal = useUserStore((s) => s.blockLocal);
  const refreshBlockedList = useUserStore((s) => s.refreshBlockedList);
  const { t } = useUiTranslate();

  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    description: "",
  });

  // ✅ 신고 모달 상태 (프론트 전용)
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    nickname: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDone, setReportDone] = useState(false);

  // 초기 동기화: 로컬이 비어있고 로그인 상태면 서버에서 차단 목록 한 번만 불러옴
  useEffect(() => {
    (async () => {
      if (!myUser) return;
      if (blockedSet.size > 0) return;
      try {
        await refreshBlockedList();
      } catch {
        // ignore
      }
    })();
  }, [myUser, blockedSet.size, refreshBlockedList]);

  // 차단 기준으로 필터링
  const visibleMessages = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    return messages.filter((m) => !blockedSet.has(String(m.userId)));
  }, [messages, blockedSet]);

  // 보이는 메시지가 변할 때 스크롤 맨 아래로
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleMessages, scrollContainerRef]);

  // 차단 처리: 서버 반영 → 로컬 즉시 반영 → 서버 목록 재동기화(fire-and-forget)
  const handleBlock = async (userId: string, userNickname: string) => {
    try {
      await blockUser(userId); // 서버 반영
      blockLocal(userId); // UI 즉시 반영
      refreshBlockedList().catch(() => {}); // 최신화 시도(실패해도 UI 유지)

      const desc = t(
        "artistChat.blockSuccessDesc",
        "{nickname}님을 차단했습니다.",
      ).replace("{nickname}", userNickname);

      setModalInfo({
        isOpen: true,
        title: t("artistChat.blockSuccessTitle", "차단 완료"),
        description: desc,
      });
    } catch {
      setModalInfo({
        isOpen: true,
        title: t("artistChat.blockErrorTitle", "오류"),
        description: t(
          "artistChat.blockErrorDesc",
          "차단 요청에 실패했습니다. 다시 시도해주세요.",
        ),
      });
    }
  };

  // ✅ 신고 모달 열기
  const openReportModal = (userId: string, userNickname: string) => {
    setReportTarget({ id: userId, nickname: userNickname });
    setReportReason("");
    setReportDone(false);
  };

  // ✅ 신고 모달 닫기
  const closeReportModal = () => {
    setReportTarget(null);
    setReportReason("");
    setReportDone(false);
  };

  // ✅ 신고 제출 (프론트에서만 사용)
  const handleSubmitReport = () => {
    if (!reportTarget || !reportReason.trim()) return;

    // 백엔드 전송 없이 콘솔에만 로그 남김
    console.log("Artist chat report:", {
      targetId: reportTarget.id,
      targetNickname: reportTarget.nickname,
      reason: reportReason,
    });

    setReportDone(true);
  };

  if (!Array.isArray(messages)) {
    return (
      <div className="p-4 text-sm text-gray-500">
        {t("artistChat.loading", "채팅을 불러오는 중...")}
      </div>
    );
  }

  if (visibleMessages.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-gray-400">
            {t("artistChat.empty", "아직 채팅 메시지가 없습니다.")}
          </p>
        </div>

        <ConfirmModal
          isOpen={modalInfo.isOpen}
          title={modalInfo.title}
          description={modalInfo.description}
          confirmText={t("common.confirm", "확인")}
          onConfirm={() => setModalInfo({ ...modalInfo, isOpen: false })}
          onCancel={() => setModalInfo({ ...modalInfo, isOpen: false })}
        />
      </>
    );
  }

  return (
    <>
      {/* ✅ 신고 모달 (AlertTriangle 포함 / 프론트 전용) */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-11/12 max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 p-5 text-gray-900">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">
                  {t(
                    "artistChat.reportTitle",
                    `${reportTarget.nickname} 님 신고하기`,
                  ).replace("{nickname}", reportTarget.nickname)}
                </h2>
                <p className="text-[11px] text-gray-500">
                  {t(
                    "artistChat.reportDesc",
                    "부적절한 채팅이나 불쾌한 행동이 있었다면 신고 사유를 작성해주세요.",
                  )}
                </p>
              </div>
            </div>

            <textarea
              className="w-full h-28 resize-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
              placeholder={t(
                "artistChat.reportPlaceholder",
                "예) 욕설 및 비방, 불쾌한 채팅, 스팸 메시지 등",
              )}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />

            {reportDone && (
              <p className="mt-2 text-[11px] text-emerald-500">
                {t(
                  "artistChat.reportSuccessMessage",
                  "신고되었습니다. 빠른 시일 내로 조치를 취하겠습니다.",
                )}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={closeReportModal}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {t("artistChat.reportClose", "닫기")}
              </button>
              <button
                type="button"
                disabled={!reportReason.trim() || reportDone}
                onClick={handleSubmitReport}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  !reportReason.trim() || reportDone
                    ? "bg-red-300 text-white cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {reportDone
                  ? t("artistChat.reportSubmitted", "신고 완료")
                  : t("artistChat.reportSubmit", "신고하기")}
              </button>
            </div>
          </div>
        </div>
      )}

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
            !!prevMsg &&
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
                className={`flex items-start gap-2 ${
                  isMyMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex flex-col ${
                    isMyMessage ? "items-end" : "items-start"
                  }`}
                >
                  {/* 같은 사용자가 연속인 경우에도 닉네임 노출 유지 */}
                  <span className="text-sm font-semibold text-gray-700 mb-1 mt-1">
                    {msg.userNickname}
                  </span>

                  <div
                    className={`flex items-end gap-2 ${
                      isSameUser ? "mt-0.5" : "mt-1"
                    }`}
                  >
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

                          {/* 로그인 상태에서만 메뉴 노출 + 자기 자신은 숨김 */}
                          {!!myUser && myUser.userId !== msg.userId && (
                            <Popover className="absolute top-0 right-0">
                              <Popover.Button className="p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100 hover:bg-black/10">
                                <MoreVertical size={16} />
                              </Popover.Button>
                              <Popover.Panel className="absolute z-10 top-0 left-full ml-1 w-36 bg-white border rounded-lg shadow-lg">
                                <div className="p-1 flex flex-col gap-1">
                                  {/* ✅ 신고하기 (프론트 전용) */}
                                  <button
                                    onClick={() =>
                                      openReportModal(
                                        msg.userId,
                                        msg.userNickname,
                                      )
                                    }
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-red-500 hover:bg-red-50 rounded-md"
                                  >
                                    <AlertTriangle size={14} />
                                    <span>
                                      {t(
                                        "artistChat.menuReport",
                                        "신고하기",
                                      )}
                                    </span>
                                  </button>

                                  {/* 차단하기 */}
                                  <button
                                    onClick={() =>
                                      handleBlock(
                                        msg.userId,
                                        msg.userNickname,
                                      )
                                    }
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md"
                                  >
                                    <UserX size={14} />
                                    <span>
                                      {t(
                                        "artistChat.menuBlock",
                                        "차단하기",
                                      )}
                                    </span>
                                  </button>
                                </div>
                              </Popover.Panel>
                            </Popover>
                          )}
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
          );
        })}
      </div>

      <ConfirmModal
        isOpen={modalInfo.isOpen}
        title={modalInfo.title}
        description={modalInfo.description}
        confirmText={t("common.confirm", "확인")}
        onConfirm={() => setModalInfo({ ...modalInfo, isOpen: false })}
        onCancel={() => setModalInfo({ ...modalInfo, isOpen: false })}
      />
    </>
  );
};

export default ArtistChatTab;

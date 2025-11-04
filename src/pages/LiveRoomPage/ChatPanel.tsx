// import { useState, useEffect, useRef } from "react";
// import {
//   Send,
//   MoreVertical,
//   UserX,
//   // LockKeyhole,
//   // Languages,
// } from "lucide-react";
// import { Popover, Transition } from "@headlessui/react";
// import { useUserStore } from "../../store/useUserStore";
// import type { ChatMessage } from "../../types/chat";
// // import { translateMessage } from "../../api/translateService";
// import { blockUser } from "../../api/userService";

// // --- 부모로부터 받아야 할 Props 타입 정의 ---
// type ChatPanelProps = {
//   messages: ChatMessage[];
//   sendMessage: (content: string) => void;
//   onBlockUser: (userId: string) => void;
// };

// // // --- 번역 상태를 관리하기 위한 타입 ---
// // export type TranslateRequest = {
// //   message: string;
// //   language: string;
// // };

// // // 번역 타입
// // type TranslationState = {
// //   loading: boolean;
// //   text?: string;
// //   error?: string;
// //   showingTranslated?: boolean;
// // };

// // 최근 메시지/이름 미리보기: 그래펨 기준 limit, 초과 시 …
// function previewGraphemes(s: string, limit: number): string {
//   if (!s) return "";
//   // @ts-ignore
//   if (typeof Intl !== "undefined" && Intl.Segmenter) {
//     // @ts-ignore
//     const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
//     const parts = Array.from(seg.segment(s)).map((p: any) => p.segment);
//     return parts.length > limit ? parts.slice(0, limit).join("") + "…" : s;
//   }
//   // 폴백: 코드포인트 기준
//   return s.length > limit ? s.slice(0, limit) + "…" : s;
// }

// // 유니코드 안전 글자수(그래펨 단위) 계산 (입력 제한용)
// function countGraphemes(s: string): number {
//   if (!s) return 0;
//   // @ts-ignore
//   if (typeof Intl !== "undefined" && Intl.Segmenter) {
//     // @ts-ignore
//     const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
//     return Array.from(seg.segment(s)).length;
//   }
//   return [...s].length;
// }

// const MAX_LEN = 100;

// // --- 차단 확인 모달 컴포넌트 ---
// const ConfirmModal = ({
//   isOpen,
//   onConfirm,
//   onCancel,
//   nickname,
// }: {
//   isOpen: boolean;
//   onConfirm: () => void;
//   onCancel: () => void;
//   nickname: string;
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-gray-700 rounded-lg p-6 shadow-xl w-full max-w-sm">
//         <h3 className="text-lg font-bold text-white">사용자 차단</h3>
//         <p className="text-sm text-gray-300 mt-2">
//           정말로{" "}
//           <span className="font-semibold text-purple-400">{nickname}</span>님을
//           차단하시겠습니까? <br />
//           차단하면 이 사용자의 메시지가 더 이상 보이지 않습니다.
//         </p>
//         <div className="mt-6 flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
//           >
//             취소
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
//           >
//             차단
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ChatPanel = ({ messages, sendMessage, onBlockUser }: ChatPanelProps) => {
//   const { myUser } = useUserStore();
//   const [newMessage, setNewMessage] = useState("");

//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const listRef = useRef<HTMLDivElement | null>(null);
//   const inputRef = useRef<HTMLTextAreaElement | null>(null);
//   const sentByPointerRef = useRef(false);
//   const isAtBottomRef = useRef(true);
//   const prevLenRef = useRef(0);

//   const [lastUnread, setLastUnread] = useState<ChatMessage | null>(null);

//   // // 번역된 메시지들을 관리하는 상태
//   // // { 메시지키: { loading: false, text: "번역된 내용" } }
//   // const [translations, setTranslations] = useState<
//   //   Record<string, TranslationState>
//   // >({});

//   // 차단 확인 모달 상태
//   const [blockConfirm, setBlockConfirm] = useState<{
//     isOpen: boolean;
//     user: { id: string; nickname: string } | null;
//   }>({ isOpen: false, user: null });

//   // ✅ 렌더에 반영되는 '바닥 여부' (배지 표시/숨김을 정확히 반영)
//   const [atBottom, setAtBottom] = useState(true);

//   // ✅ 입력 영역 높이 측정(겹침 방지용)
//   const footerRef = useRef<HTMLDivElement | null>(null);
//   const [footerH, setFooterH] = useState(0);

//   // ✅ 한 줄/멀티라인 판단용
//   const [isMultiline, setIsMultiline] = useState(false);

//   // 입력영역 높이 자동 추적
//   useEffect(() => {
//     const el = footerRef.current;
//     if (!el) return;
//     const update = () => setFooterH(el.offsetHeight);
//     const ro = new ResizeObserver(update);
//     ro.observe(el);
//     update();
//     return () => ro.disconnect();
//   }, []);

//   const calcIsAtBottom = (el: HTMLElement) => {
//     const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
//     return gap <= 100;
//   };

//   const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
//     messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
//   };

//   const onScroll = () => {
//     const el = listRef.current;
//     if (!el) return;

//     const atBottomNow = calcIsAtBottom(el);
//     isAtBottomRef.current = atBottomNow;
//     setAtBottom(atBottomNow);

//     if (atBottomNow && lastUnread) {
//       setLastUnread(null);
//     }
//   };

//   useEffect(() => {
//     const addedCount = messages.length - prevLenRef.current;

//     if (addedCount > 0) {
//       const last = messages[messages.length - 1];

//       // ✅ 시스템 메시지(ENTER)만 제외. TALK 외 다른 값이 와도 정상 동작
//       const isSystem = last?.chatType === "ENTER";
//       if (!last || isSystem) {
//         prevLenRef.current = messages.length;
//         return;
//       }

//       // ✅ 문자열 비교로 타입 혼용 방지
//       const fromMe =
//         String(last?.senderId ?? "") === String(myUser?.userId ?? "");

//       // DOM 업데이트를 확실하게 기다림
//       requestAnimationFrame(() => {
//         requestAnimationFrame(() => {
//           const el = listRef.current;
//           if (!el) return;

//           const wasAtBottom = calcIsAtBottom(el);
//           isAtBottomRef.current = wasAtBottom;
//           setAtBottom(wasAtBottom);

//           if (fromMe || wasAtBottom) {
//             scrollToBottom(fromMe ? "auto" : "smooth");
//             setLastUnread(null);
//           } else {
//             setLastUnread(last);
//           }
//         });
//       });
//     }

//     prevLenRef.current = messages.length;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [messages.length, myUser?.userId]);

//   useEffect(() => {
//     setTimeout(() => {
//       scrollToBottom("auto");
//       setAtBottom(true);
//       isAtBottomRef.current = true;
//     }, 100);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ✅ textarea 자동 리사이즈 (최대 높이 제한) + 멀티라인 판정
//   const autoResize = () => {
//     const el = inputRef.current;
//     if (!el) return;
//     const MAX_H = 160; // px
//     el.style.height = "auto";
//     const h = Math.min(el.scrollHeight, MAX_H);
//     el.style.height = `${h}px`;
//     el.style.overflowY = el.scrollHeight > MAX_H ? "auto" : "hidden";

//     // ✅ 한 줄 기준 높이(대략 48px) 이상이면 멀티라인으로 판단
//     setIsMultiline(h > 48);
//   };

//   useEffect(() => {
//     autoResize();
//   }, [newMessage]);

//   const handleSendMessage = () => {
//     const v = newMessage.trim();
//     if (!v) return;
//     if (countGraphemes(newMessage) > MAX_LEN) return; // ✅ 100자 제한

//     sendMessage(v);
//     setNewMessage("");

//     // 전송 직후 다시 포커스 (렌더 한 프레임 뒤에)
//     requestAnimationFrame(() => {
//       scrollToBottom("auto"); // ✅ 내 메시지는 항상 하단으로
//       setAtBottom(true);
//       isAtBottomRef.current = true;
//       const el = inputRef.current;
//       if (el) {
//         el.style.height = "auto";
//         el.style.overflowY = "hidden";
//         el.focus({ preventScroll: true });
//       }
//     });
//   };

//   // // 번역 API 호출 함수 (수정됨)
//   // const handleTranslate = async (messageKey: string, text: string) => {
//   //   const current = translations[messageKey];

//   //   // 번역문이 이미 있다면 API 재호출 없이 토글만
//   //   if (current?.text && !current.loading) {
//   //     setTranslations((prev) => ({
//   //       ...prev,
//   //       [messageKey]: {
//   //         ...current,
//   //         showingTranslated: !current.showingTranslated,
//   //       },
//   //     }));
//   //     return;
//   //   }

//   //   // 이미 로딩 중이면 무시
//   //   if (current?.loading) return;

//   //   // 최초 번역 호출
//   //   setTranslations((prev) => ({
//   //     ...prev,
//   //     [messageKey]: { loading: true, showingTranslated: false },
//   //   }));

//   //   try {
//   //     const targetLang = (myUser?.language || "ko").toLowerCase();
//   //     console.log("[translate] target:", targetLang, "msg:", text);
//   //     const translated = await translateMessage(text, targetLang);

//   //     setTranslations((prev) => ({
//   //       ...prev,
//   //       [messageKey]: {
//   //         loading: false,
//   //         text: translated,
//   //         showingTranslated: true, // 첫 클릭 후 번역문 보여주기
//   //       },
//   //     }));
//   //   } catch (err) {
//   //     console.error("Translation error:", err);
//   //     setTranslations((prev) => ({
//   //       ...prev,
//   //       [messageKey]: {
//   //         loading: false,
//   //         error: "번역 실패",
//   //         showingTranslated: false,
//   //       },
//   //     }));
//   //   }
//   // };

//   // 차단 확인 모달 열기
//   const openBlockConfirm = (user: { id: string; nickname: string }) => {
//     setBlockConfirm({ isOpen: true, user });
//   };

//   // 차단 확정
//   const confirmBlock = async () => {
//     if (!blockConfirm.user) return;
//     const id = blockConfirm.user.id;

//     onBlockUser(id);
//     try {
//       const res = await blockUser(id);
//       console.log(res.message);
//     } catch (err) {
//       console.error("차단 실패:", err);
//     } finally {
//       setBlockConfirm({ isOpen: false, user: null });
//     }
//   };

//   const charCount = countGraphemes(newMessage);
//   const overLimit = charCount > MAX_LEN;

//   return (
//     <>
//       <ConfirmModal
//         isOpen={blockConfirm.isOpen}
//         onConfirm={confirmBlock}
//         onCancel={() => setBlockConfirm({ isOpen: false, user: null })}
//         nickname={blockConfirm.user?.nickname ?? ""}
//       />

//       {/* ✅ 배지 위치를 위해 relative로 감싼다 (이 안에서만 absolute로 배치) */}
//       <div className="relative flex flex-col h-full bg-gray-800 text-white">
//         {/* 메시지 목록 영역 */}
//         {/* <div className="flex-1 space-y-4 overflow-y-auto p-4"> */}
//         <div
//           ref={listRef}
//           onScroll={onScroll}
//           className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 min-h-0"
//           // ✅ 실제 padding-bottom은 작게 유지, 스크롤 패딩만 입력창 높이 반영 → 시각적 여백 제거
//           style={{
//             paddingBottom: 8,
//             scrollPaddingBottom: (footerH || 88) + 8,
//             scrollbarGutter: "stable both-edges" as any, // 레이아웃 점프 감소(지원 브라우저)
//           }}
//         >
//           {messages.map((msg, index) => {
//             if (msg.chatType === "ENTER") {
//               return (
//                 <div
//                   key={`system-${index}`}
//                   className="text-center text-xs text-gray-500 py-1"
//                 >
//                   {msg.content}
//                 </div>
//               );
//             }

//             const uniqueKey = `${msg.senderId}-${msg.sentAt || index}`;
//             const isMyMessage =
//               String(msg.senderId ?? "") === String(myUser?.userId ?? "");
//             // const t = translations[uniqueKey];

//             // const contentToShow =
//             //   t?.showingTranslated && t?.text ? t.text : msg.content;

//             const contentToShow = msg.content;

//             // const translateBtnLabel = t?.loading
//             //   ? "번역 중..."
//             //   : t?.text
//             //   ? t.showingTranslated
//             //     ? "되돌리기"
//             //     : "번역하기"
//             //   : "번역하기";

//             return (
//               <div
//                 key={uniqueKey}
//                 className={`flex flex-col ${
//                   isMyMessage ? "items-end" : "items-start"
//                 }`}
//               >
//                 <span className="text-xs text-gray-500 mb-1">
//                   {msg.senderNickName}
//                 </span>
//                 <div
//                   className={`group relative flex items-end gap-2 max-w-[85%] ${
//                     isMyMessage ? "flex-row-reverse" : "flex-row"
//                   }`}
//                 >
//                   {/* 메시지 말풍선 */}
//                   <div
//                     className={`relative group px-4 py-2 rounded-lg text-sm ${
//                       isMyMessage ? "bg-purple-600" : "bg-gray-700"
//                     } break-all`}
//                   >
//                     {/* 말풍선 내용 */}
//                     {/* {t?.loading ? (
//                       <span className="text-gray-300 italic">번역 중...</span>
//                     ) : t?.error ? (
//                       <span className="text-red-400">{t.error}</span>
//                     ) : (
//                       <span className={!isMyMessage ? "pr-5" : ""}>
//                         {contentToShow}
//                       </span>
//                     )} */}

//                     <span className={!isMyMessage ? "pr-5" : ""}>
//                       {contentToShow}
//                     </span>

//                     {/* 다른 사람 메시지에만 점 3개 아이콘 표시 (위치 변경됨) */}
//                     {!isMyMessage && (
//                       <Popover className="absolute top-1 right-1">
//                         <Popover.Button className="p-0.5 rounded-full hover:bg-black/20 focus:outline-none">
//                           <MoreVertical size={14} className="text-white" />
//                         </Popover.Button>
//                         <Transition
//                           enter="transition duration-100 ease-out"
//                           enterFrom="transform scale-95 opacity-0"
//                           enterTo="transform scale-100 opacity-100"
//                           leave="transition duration-75 ease-out"
//                           leaveFrom="transform scale-100 opacity-100"
//                           leaveTo="transform scale-95 opacity-0"
//                         >
//                           <Popover.Panel className="absolute z-10 top-0 left-full ml-2 w-40 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
//                             <div className="flex flex-col p-1">
//                               {/* <button
//                                 onClick={() =>
//                                   handleTranslate(uniqueKey, msg.content)
//                                 }
//                                 className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
//                               >
//                                 <Languages size={14} />
//                                 <span className="whitespace-nowrap">
//                                   {translateBtnLabel}
//                                 </span>
//                               </button> */}
//                               <button
//                                 onClick={() =>
//                                   openBlockConfirm({
//                                     id: msg.senderId,
//                                     nickname: msg.senderNickName,
//                                   })
//                                 }
//                                 className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
//                               >
//                                 <UserX size={14} />
//                                 <span className="whitespace-nowrap">
//                                   차단하기
//                                 </span>
//                               </button>
//                             </div>
//                           </Popover.Panel>
//                         </Transition>
//                       </Popover>
//                     )}
//                   </div>

//                   {/* 타임스탬프 */}
//                   <span className="text-xs text-gray-500 whitespace-nowrap">
//                     {new Date(msg.sentAt).toLocaleTimeString("ko-KR", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                 </div>
//               </div>
//             );
//           })}

//           {/* 마지막 스크롤 앵커: 실제 레이아웃 여백 없이 스크롤만 보정 */}
//           <div
//             ref={messagesEndRef}
//             style={{ scrollMarginBottom: (footerH || 88) + 8 }}
//           />
//         </div>

//         {/* ✅ 배지를 '컴포넌트 내부'에 절대 위치로 배치: 비디오 가운데로 안 튐 */}
//         {lastUnread && !atBottom && (
//           <div
//             onClick={() => {
//               setLastUnread(null);
//               scrollToBottom("smooth");
//               setAtBottom(true);
//               isAtBottomRef.current = true;
//             }}
//             className="absolute left-1/2 -translate-x-1/2 z-[200] cursor-pointer"
//             style={{
//               bottom: (footerH || 88) + 8, // 채팅 입력창 '바로 위'
//               paddingBottom: "env(safe-area-inset-bottom)",
//             }}
//           >
//             {/* 카톡 느낌의 말풍선 카드: '닉네임(7자 …)  내용(10자 …)' (중간 점 제거) */}
//             <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-3 py-2">
//               <div className="flex items-center gap-2 max-w-[280px]">
//                 <span className="text-gray-900 text-sm font-semibold shrink-0">
//                   {previewGraphemes(lastUnread.senderNickName ?? "", 7)}
//                 </span>
//                 <span className="text-gray-800 text-sm truncate">
//                   {previewGraphemes(lastUnread.content ?? "", 10)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 메시지 입력 영역 (세로 확장 textarea + 100자 제한) */}
//         <div
//           ref={footerRef}
//           className="p-3 border-t border-gray-700 bg-gray-800/80"
//           // ✅ 모든 기기에서 일관되게 맞추기 위한 전송 버튼 크기/간격을 CSS 변수로 선언
//           style={
//             {
//               // @ts-ignore
//               "--send-size": "38px", // 34~44px 사이 조정 가능
//               "--send-gap": "10px",
//             } as React.CSSProperties
//           }
//         >
//           <div className="relative">
//             <textarea
//               ref={inputRef}
//               rows={1}
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               onInput={autoResize}
//               onKeyDown={(e) => {
//                 // @ts-ignore
//                 if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
//                   e.preventDefault();
//                   if (!overLimit) handleSendMessage();
//                 }
//               }}
//               placeholder={myUser ? "메시지를 입력하세요..." : "게스트로 채팅하기..."}
//               className={`w-full bg-gray-700 border rounded-lg
//                           px-4 py-3
//                           text-base md:text-sm leading-6
//                           outline-none transition-colors resize-none overflow-y-hidden max-h-40
//                           ${overLimit ? "border-red-500 focus:border-red-500" : "border-gray-600 focus:border-purple-500"}`}
//               // ✅ 전송 버튼과 겹치지 않도록 우측 안쪽 패딩 확보( +14px 로 여유 증가)
//               style={{
//                 paddingRight: `calc(var(--send-size) + var(--send-gap) + 14px)`,
//               }}
//             />

//             {/* ✅ 전송 버튼: 포커스 링 분리 + 정렬 동적 + 살짝 바깥으로 */}
//             <button
//               type="button"
//               tabIndex={-1}
//               onPointerDown={(e) => { e.preventDefault(); }}
//               onPointerUp={(e) => { e.preventDefault(); sentByPointerRef.current = true; if (!overLimit) handleSendMessage(); }}
//               onClick={(e) => {
//                 if (sentByPointerRef.current) { sentByPointerRef.current = false; return; }
//                 e.preventDefault();
//                 if (!overLimit) handleSendMessage();
//               }}
//               disabled={!newMessage.trim() || overLimit}
//               className="absolute rounded-full flex items-center justify-center
//                          disabled:bg-gray-700 disabled:cursor-not-allowed
//                          bg-gray-600 hover:bg-gray-500 transition-colors"
//               style={{
//                 width: "var(--send-size)",
//                 height: "var(--send-size)",
//                 // 살짝 바깥으로 빼서 포커스 링과 겹침 최소화
//                 right: "calc(var(--send-gap) - 6px)",
//                 // 한 줄이면 중앙, 여러 줄이면 아래 정렬
//                 ...(isMultiline
//                   ? { bottom: "var(--send-gap)" }
//                   : { top: "50%", transform: "translateY(-50%)" }),
//                 // 패널 배경(#1f2937 = tailwind bg-gray-800)으로 링 분리
//                 boxShadow: "0 0 0 4px #1f2937",
//                 zIndex: 1,
//               }}
//             >
//               <Send size={18} className="text-white" />
//             </button>

//             <div
//               className="mt-1 flex justify-end"
//               // ✅ 카운터도 동일한 우측 여백 확보
//               style={{ paddingRight: `calc(var(--send-size) + var(--send-gap))` }}
//             >
//               <span className={`text-xs ${overLimit ? "text-red-400" : "text-gray-400"}`}>
//                 {charCount}/{MAX_LEN}{overLimit ? " (최대 초과)" : ""}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* <div className="p-3 border-t border-gray-700 bg-gray-800/80">
//           {myUser ? (
//             <div className="relative flex items-center">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 // onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//                 onKeyDown={(e) => {
//                   // 한글 조합 중 엔터 예외
//                   // @ts-ignore
//                   if (e.key === "Enter" && !e.nativeEvent?.isComposing) {
//                     e.preventDefault();
//                     handleSendMessage();
//                   }
//                 }}
//                 placeholder="메시지를 입력하세요..."
//                 // className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors pr-12"
//                 className="w-full bg-gray-700 border border-gray-600 rounded-lg
//               px-4 md:px-4 py-3 md:py-2.5
//               text-base md:text-sm
//               outline-none focus:border-purple-500 transition-colors pr-12"
//               />
//               <button
//                 type="button"
//                 tabIndex={-1}
//                 onPointerDown={(e) => {
//                   e.preventDefault();
//                 }}
//                 onPointerUp={(e) => {
//                   e.preventDefault();
//                   sentByPointerRef.current = true;
//                   handleSendMessage();
//                 }}
//                 onClick={(e) => {
//                   if (sentByPointerRef.current) {
//                     sentByPointerRef.current = false;
//                     return;
//                   }
//                   e.preventDefault();
//                   handleSendMessage();
//                 }}
//                 disabled={!newMessage.trim()}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed touch-manipulation"
//               >
//                 <Send size={18} className="text-white" />
//               </button>
//             </div>
//           ) : (
//             <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4 mx-2">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-800">
//                   <LockKeyhole className="text-gray-500" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-gray-200">
//                     로그인 후 채팅 가능
//                   </p>
//                   <p className="text-xs text-gray-400">
//                     로그인하고 대화에 참여하세요.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div> */}

//       </div>
//     </>
//   );
// };

// export default ChatPanel;


// import { useState, useEffect, useRef } from "react";
// import {
//   Send,
//   MoreVertical,
//   UserX,
// } from "lucide-react";
// import { Popover, Transition } from "@headlessui/react";
// import { useUserStore } from "../../store/useUserStore";
// import type { ChatMessage } from "../../types/chat";
// import { blockUser } from "../../api/userService";

// type ChatPanelProps = {
//   messages: ChatMessage[];
//   sendMessage: (content: string) => Promise<void> | void;
//   onBlockUser: (userId: string) => void;
// };

// // 최근 메시지/이름 미리보기: 그래펨 기준 limit, 초과 시 …
// function previewGraphemes(s: string, limit: number): string {
//   if (!s) return "";
//   // @ts-ignore
//   if (typeof Intl !== "undefined" && Intl.Segmenter) {
//     // @ts-ignore
//     const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
//     const parts = Array.from(seg.segment(s)).map((p: any) => p.segment);
//     return parts.length > limit ? parts.slice(0, limit).join("") + "…" : s;
//   }
//   return s.length > limit ? s.slice(0, limit) + "…" : s;
// }

// function countGraphemes(s: string): number {
//   if (!s) return 0;
//   // @ts-ignore
//   if (typeof Intl !== "undefined" && Intl.Segmenter) {
//     // @ts-ignore
//     const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
//     return Array.from(seg.segment(s)).length;
//   }
//   return [...s].length;
// }

// const MAX_LEN = 500;

// // --- 차단 확인 모달 ---
// const ConfirmModal = ({
//   isOpen,
//   onConfirm,
//   onCancel,
//   nickname,
// }: {
//   isOpen: boolean;
//   onConfirm: () => void;
//   onCancel: () => void;
//   nickname: string;
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-gray-700 rounded-lg p-6 shadow-xl w-full max-w-sm">
//         <h3 className="text-lg font-bold text-white">사용자 차단</h3>
//         <p className="text-sm text-gray-300 mt-2">
//           정말로{" "}
//           <span className="font-semibold text-purple-400">{nickname}</span>님을
//           차단하시겠습니까? <br />
//           차단하면 이 사용자의 메시지가 더 이상 보이지 않습니다.
//         </p>
//         <div className="mt-6 flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
//           >
//             취소
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
//           >
//             차단
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ChatPanel = ({ messages, sendMessage, onBlockUser }: ChatPanelProps) => {
//   const { myUser } = useUserStore();
//   const [newMessage, setNewMessage] = useState("");

//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const listRef = useRef<HTMLDivElement | null>(null);
//   const inputRef = useRef<HTMLTextAreaElement | null>(null);
//   const sentByPointerRef = useRef(false);
//   const isAtBottomRef = useRef(true);
//   const prevLenRef = useRef(0);

//   const [lastUnread, setLastUnread] = useState<ChatMessage | null>(null);

//   const [blockConfirm, setBlockConfirm] = useState<{
//     isOpen: boolean;
//     user: { id: string; nickname: string } | null;
//   }>({ isOpen: false, user: null });

//   const [atBottom, setAtBottom] = useState(true);

//   const footerRef = useRef<HTMLDivElement | null>(null);
//   const [footerH, setFooterH] = useState(0);
//   const [isMultiline, setIsMultiline] = useState(false);

//   // ✅ 여기부터: 도배 감지용 상태
//   const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
//   // 내가 방금 보낸 메시지 기억
//   const pendingSendRef = useRef<{ content: string; at: number } | null>(null);
//   // 마지막 메시지 개수
//   const lastMsgCountRef = useRef<number>(messages.length);

//   useEffect(() => {
//     const el = footerRef.current;
//     if (!el) return;
//     const update = () => setFooterH(el.offsetHeight);
//     const ro = new ResizeObserver(update);
//     ro.observe(el);
//     update();
//     return () => ro.disconnect();
//   }, []);

//   const calcIsAtBottom = (el: HTMLElement) => {
//     const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
//     return gap <= 100;
//   };

//   const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
//     messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
//   };

//   const onScroll = () => {
//     const el = listRef.current;
//     if (!el) return;
//     const atBottomNow = calcIsAtBottom(el);
//     isAtBottomRef.current = atBottomNow;
//     setAtBottom(atBottomNow);

//     if (atBottomNow && lastUnread) {
//       setLastUnread(null);
//     }
//   };

//   // 메시지 들어올 때 처리 (원래 있던 로직)
//   useEffect(() => {
//     const addedCount = messages.length - prevLenRef.current;

//     if (addedCount > 0) {
//       const last = messages[messages.length - 1];
//       const isSystem = (last as any)?.chatType === "ENTER";
//       if (!last || isSystem) {
//         prevLenRef.current = messages.length;
//         return;
//       }

//       const fromMe =
//         String(last?.senderId ?? "") === String(myUser?.userId ?? "");

//       requestAnimationFrame(() => {
//         requestAnimationFrame(() => {
//           const el = listRef.current;
//           if (!el) return;

//           const wasAtBottom = calcIsAtBottom(el);
//           isAtBottomRef.current = wasAtBottom;
//           setAtBottom(wasAtBottom);

//           if (fromMe || wasAtBottom) {
//             scrollToBottom(fromMe ? "auto" : "smooth");
//             setLastUnread(null);
//           } else {
//             setLastUnread(last);
//           }
//         });
//       });
//     }

//     prevLenRef.current = messages.length;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [messages.length, myUser?.userId]);

//   useEffect(() => {
//     setTimeout(() => {
//       scrollToBottom("auto");
//       setAtBottom(true);
//       isAtBottomRef.current = true;
//     }, 100);
//   }, []);

//   // textarea 자동 리사이즈
//   const autoResize = () => {
//     const el = inputRef.current;
//     if (!el) return;
//     const MAX_H = 160;
//     el.style.height = "auto";
//     const h = Math.min(el.scrollHeight, MAX_H);
//     el.style.height = `${h}px`;
//     el.style.overflowY = el.scrollHeight > MAX_H ? "auto" : "hidden";
//     setIsMultiline(h > 48);
//   };

//   useEffect(() => {
//     autoResize();
//   }, [newMessage]);

//   // ✅ 도배 감지 핵심: 메시지가 실제로 도착했는지 확인
//   useEffect(() => {
//     const pending = pendingSendRef.current;
//     if (!pending) {
//       lastMsgCountRef.current = messages.length;
//       return;
//     }

//     // 1) 내가 로그인한 경우: senderId로 판별
//     const last = messages[messages.length - 1];
//     if (
//       last &&
//       myUser?.userId &&
//       String(last.senderId) === String(myUser.userId) &&
//       last.content === pending.content
//     ) {
//       // 서버가 받아줬다!
//       pendingSendRef.current = null;
//       lastMsgCountRef.current = messages.length;
//       return;
//     }

//     // 2) 게스트거나 senderId 판별이 안 되는 경우:
//     // 방금 보냈는데 메시지 개수가 1도 안 늘었다? → 좀 이따가 타임아웃에서 막혔다고 보자.
//     lastMsgCountRef.current = messages.length;
//   }, [messages, myUser?.userId]);

//   const handleSendMessage = () => {
//     const v = newMessage.trim();
//     if (!v) return;
//     if (countGraphemes(newMessage) > MAX_LEN) return;

//     // 이미 도배로 막혀있으면 전송 안함
//     if (rateLimitedUntil && Date.now() < rateLimitedUntil) {
//       return;
//     }

//     // 보낸 시각 기억
//     const sentAt = Date.now();
//     pendingSendRef.current = { content: v, at: sentAt };

//     // 실제 전송
//     const maybePromise = sendMessage(v);
//     setNewMessage("");

//     // 포커스/스크롤
//     requestAnimationFrame(() => {
//       scrollToBottom("auto");
//       setAtBottom(true);
//       isAtBottomRef.current = true;
//       const el = inputRef.current;
//       if (el) {
//         el.style.height = "auto";
//         el.style.overflowY = "hidden";
//         el.focus({ preventScroll: true });
//       }
//     });

//     // Promise로 온다면 에러도 한번 봐줌 (혹시나)
//     Promise.resolve(maybePromise).catch((err) => {
//       // 혹시 진짜로 에러를 던져주는 경우
//       const type =
//         (err as any)?.response?.data?.type || (err as any)?.type || "";
//       if (type === "CHAT_RATE_LIMITED" || (err as any)?.status === 429) {
//         setRateLimitedUntil(Date.now() + 5000);
//         pendingSendRef.current = null;
//       }
//     });

//     // ✅ 600ms 안에 내 메시지가 안 오면 → 도배로 막혔다고 보기
//     setTimeout(() => {
//       const pendingNow = pendingSendRef.current;
//       if (!pendingNow) return; // 이미 도착해서 지워졌음

//       // 아직도 같은 전송이 남아있고, 600ms 지났으면
//       if (pendingNow.at === sentAt) {
//         setRateLimitedUntil(Date.now() + 5000);
//         pendingSendRef.current = null;
//       }
//     }, 600);
//   };

//   const openBlockConfirm = (user: { id: string; nickname: string }) => {
//     setBlockConfirm({ isOpen: true, user });
//   };

//   const confirmBlock = async () => {
//     if (!blockConfirm.user) return;
//     const id = blockConfirm.user.id;

//     onBlockUser(id);
//     try {
//       const res = await blockUser(id);
//       console.log(res.message);
//     } catch (err) {
//       console.error("차단 실패:", err);
//     } finally {
//       setBlockConfirm({ isOpen: false, user: null });
//     }
//   };

//   const charCount = countGraphemes(newMessage);
//   const overLimit = charCount > MAX_LEN;

//   const previewContent = (m: ChatMessage | null) => {
//     if (!m) return "";
//     if ((m as any).isImage) return "[GIF]";
//     return previewGraphemes(m.content ?? "", 10);
//   };

//   const isRateLimitedNow =
//     rateLimitedUntil !== null && Date.now() < rateLimitedUntil;

//   return (
//     <>
//       <ConfirmModal
//         isOpen={blockConfirm.isOpen}
//         onConfirm={confirmBlock}
//         onCancel={() => setBlockConfirm({ isOpen: false, user: null })}
//         nickname={blockConfirm.user?.nickname ?? ""}
//       />

//       <div className="relative flex flex-col h-full bg-gray-800 text-white">
//         {/* ✅ 도배 안내 말풍선 */}
//         {isRateLimitedNow && (
//           <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[300]">
//             <div className="bg-red-500/95 text-white text-sm px-4 py-2 rounded-full shadow-lg border border-red-300/40">
//               채팅 도배로 5초간 채팅이 제한됩니다.
//             </div>
//           </div>
//         )}

//         {/* 메시지 목록 */}
//         <div
//           ref={listRef}
//           onScroll={onScroll}
//           className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 min-h-0"
//           style={{
//             paddingBottom: 8,
//             scrollPaddingBottom: (footerH || 88) + 8,
//             scrollbarGutter: "stable both-edges" as any,
//           }}
//         >
//           {messages.map((msg, index) => {
//             if ((msg as any).chatType === "ENTER") {
//               return (
//                 <div
//                   key={`system-${index}`}
//                   className="text-center text-xs text-gray-500 py-1"
//                 >
//                   {msg.content}
//                 </div>
//               );
//             }

//             const uniqueKey = `${msg.senderId}-${(msg as any).sentAt || index}`;
//             const isMyMessage =
//               String(msg.senderId ?? "") === String(myUser?.userId ?? "");

//             return (
//               <div
//                 key={uniqueKey}
//                 className={`flex flex-col ${
//                   isMyMessage ? "items-end" : "items-start"
//                 }`}
//               >
//                 <span className="text-xs text-gray-500 mb-1">
//                   {msg.senderNickName}
//                 </span>

//                 <div
//                   className={`group relative flex items-end gap-2 max-w-[85%] ${
//                     isMyMessage ? "flex-row-reverse" : "flex-row"
//                   }`}
//                 >
//                   {(msg as any).isImage ? (
//                     <div className="relative">
//                       <img
//                         src={msg.content}
//                         alt="gif"
//                         className="rounded-2xl border border-black/5
//                                   max-w-full sm:max-w-[240px] max-h-[240px]
//                                   object-contain block"
//                         style={{
//                           width: "100%",
//                           height: "auto",
//                         }}
//                         loading="lazy"
//                         onLoad={() => scrollToBottom("auto")}
//                         onError={(e) => {
//                           (e.currentTarget as HTMLImageElement).style.display =
//                             "none";
//                         }}
//                       />
//                       {!isMyMessage && (
//                         <Popover className="absolute top-1 right-1">
//                           <Popover.Button className="p-0.5 rounded-full bg-black/30 hover:bg-black/50 focus:outline-none">
//                             <MoreVertical size={14} className="text-white" />
//                           </Popover.Button>
//                           <Transition
//                             enter="transition duration-100 ease-out"
//                             enterFrom="transform scale-95 opacity-0"
//                             enterTo="transform scale-100 opacity-100"
//                             leave="transition duration-75 ease-out"
//                             leaveFrom="transform scale-100 opacity-100"
//                             leaveTo="transform scale-95 opacity-0"
//                           >
//                             <Popover.Panel className="absolute z-10 top-0 left-full ml-2 w-40 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
//                               <div className="flex flex-col p-1">
//                                 <button
//                                   onClick={() =>
//                                     openBlockConfirm({
//                                       id: msg.senderId,
//                                       nickname: msg.senderNickName,
//                                     })
//                                   }
//                                   className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
//                                 >
//                                   <UserX size={14} />
//                                   <span className="whitespace-nowrap">
//                                     차단하기
//                                   </span>
//                                 </button>
//                               </div>
//                             </Popover.Panel>
//                           </Transition>
//                         </Popover>
//                       )}
//                     </div>
//                   ) : (
//                     <div
//                       className={`relative group px-4 py-2 rounded-lg text-sm ${
//                         isMyMessage ? "bg-purple-600" : "bg-gray-700"
//                       } break-all`}
//                     >
//                       <span className={!isMyMessage ? "pr-5" : ""}>
//                         {msg.content}
//                       </span>

//                       {!isMyMessage && (
//                         <Popover className="absolute top-1 right-1">
//                           <Popover.Button className="p-0.5 rounded-full hover:bg-black/20 focus:outline-none">
//                             <MoreVertical size={14} className="text-white" />
//                           </Popover.Button>
//                           <Transition
//                             enter="transition duration-100 ease-out"
//                             enterFrom="transform scale-95 opacity-0"
//                             enterTo="transform scale-100 opacity-100"
//                             leave="transition duration-75 ease-out"
//                             leaveFrom="transform scale-100 opacity-100"
//                             leaveTo="transform scale-95 opacity-0"
//                           >
//                             <Popover.Panel className="absolute z-10 top-0 left-full ml-2 w-40 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
//                               <div className="flex flex-col p-1">
//                                 <button
//                                   onClick={() =>
//                                     openBlockConfirm({
//                                       id: msg.senderId,
//                                       nickname: msg.senderNickName,
//                                     })
//                                   }
//                                   className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
//                                 >
//                                   <UserX size={14} />
//                                   <span className="whitespace-nowrap">
//                                     차단하기
//                                   </span>
//                                 </button>
//                               </div>
//                             </Popover.Panel>
//                           </Transition>
//                         </Popover>
//                       )}
//                     </div>
//                   )}

//                   <span className="text-xs text-gray-500 whitespace-nowrap">
//                     {new Date((msg as any).sentAt).toLocaleTimeString("ko-KR", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                 </div>
//               </div>
//             );
//           })}

//           <div
//             ref={messagesEndRef}
//             style={{ scrollMarginBottom: (footerH || 88) + 8 }}
//           />
//         </div>

//         {lastUnread && !atBottom && (
//           <div
//             onClick={() => {
//               setLastUnread(null);
//               scrollToBottom("smooth");
//               setAtBottom(true);
//               isAtBottomRef.current = true;
//             }}
//             className="absolute left-1/2 -translate-x-1/2 z-[200] cursor-pointer"
//             style={{
//               bottom: (footerH || 88) + 8,
//               paddingBottom: "env(safe-area-inset-bottom)",
//             }}
//           >
//             <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-3 py-2">
//               <div className="flex items-center gap-2 max-w-[280px]">
//                 <span className="text-gray-900 text-sm font-semibold shrink-0">
//                   {previewGraphemes(lastUnread.senderNickName ?? "", 7)}
//                 </span>
//                 <span className="text-gray-800 text-sm truncate">
//                   {previewContent(lastUnread)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 입력 영역 */}
//         <div
//           ref={footerRef}
//           className="p-3 border-t border-gray-700 bg-gray-800/80"
//         >
//           <div
//             className={`rounded-lg border bg-gray-700 transition-colors
//                         ${
//                           overLimit
//                             ? "border-red-500"
//                             : "border-gray-600 focus-within:border-purple-500"
//                         } ${
//               isRateLimitedNow ? "opacity-70" : ""
//             }`}
//           >
//             <div
//               className={`flex ${
//                 isMultiline ? "items-end" : "items-center"
//               } gap-2 px-3 py-2`}
//             >
//               <textarea
//                 ref={inputRef}
//                 rows={1}
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onInput={autoResize}
//                 onKeyDown={(e) => {
//                   // @ts-ignore
//                   if (
//                     e.key === "Enter" &&
//                     !e.shiftKey &&
//                     !e.nativeEvent?.isComposing
//                   ) {
//                     e.preventDefault();
//                     if (!overLimit && !isRateLimitedNow) handleSendMessage();
//                   }
//                 }}
//                 placeholder={
//                   isRateLimitedNow
//                     ? "채팅 도배로 잠시 제한되었습니다."
//                     : myUser
//                     ? "메시지를 입력하세요..."
//                     : "게스트로 채팅하기..."
//                 }
//                 className="flex-1 bg-transparent border-0 outline-none resize-none max-h-40
//                           text-base md:text-sm leading-6 placeholder:text-gray-400
//                           focus:ring-0 p-0"
//                 disabled={isRateLimitedNow}
//               />

//               <button
//                 type="button"
//                 tabIndex={-1}
//                 onPointerDown={(e) => {
//                   e.preventDefault();
//                 }}
//                 onPointerUp={(e) => {
//                   e.preventDefault();
//                   sentByPointerRef.current = true;
//                   if (!overLimit && !isRateLimitedNow) handleSendMessage();
//                 }}
//                 onClick={(e) => {
//                   if (sentByPointerRef.current) {
//                     sentByPointerRef.current = false;
//                     return;
//                   }
//                   e.preventDefault();
//                   if (!overLimit && !isRateLimitedNow) handleSendMessage();
//                 }}
//                 disabled={
//                   !newMessage.trim() || overLimit || isRateLimitedNow
//                 }
//                 className="h-9 w-9 rounded-full flex items-center justify-center
//                           bg-gray-600 hover:bg-gray-500 transition-colors
//                           disabled:bg-gray-700 disabled:cursor-not-allowed
//                           shrink-0"
//                 aria-label="메시지 전송"
//               >
//                 <Send size={18} className="text-white" />
//               </button>
//             </div>
//           </div>

//           <div className="mt-1 flex justify-end">
//             <span
//               className={`text-xs ${
//                 overLimit ? "text-red-400" : "text-gray-400"
//               }`}
//             >
//               {charCount}/{MAX_LEN}
//               {overLimit ? " (최대 초과)" : ""}
//             </span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ChatPanel;

// import { useState, useEffect, useRef } from "react";
// import { Send, MoreVertical, UserX } from "lucide-react";
// import { Popover, Transition } from "@headlessui/react";
// import { useUserStore } from "../../store/useUserStore";
// import type { ChatMessage } from "../../types/chat";
// import { blockUser } from "../../api/userService";

// type ChatPanelProps = {
//   messages: ChatMessage[];
//   sendMessage: (content: string) => Promise<void> | void;
//   onBlockUser: (userId: string) => void;
// };

// // 최근 메시지/이름 미리보기
// function previewGraphemes(s: string, limit: number): string {
//   if (!s) return "";
//   // @ts-ignore
//   if (typeof Intl !== "undefined" && Intl.Segmenter) {
//     // @ts-ignore
//     const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
//     const parts = Array.from(seg.segment(s)).map((p: any) => p.segment);
//     return parts.length > limit ? parts.slice(0, limit).join("") + "…" : s;
//   }
//   return s.length > limit ? s.slice(0, limit) + "…" : s;
// }

// function countGraphemes(s: string): number {
//   if (!s) return 0;
//   // @ts-ignore
//   if (typeof Intl !== "undefined" && Intl.Segmenter) {
//     // @ts-ignore
//     const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
//     return Array.from(seg.segment(s)).length;
//   }
//   return [...s].length;
// }

// const MAX_LEN = 500;

// // --- 차단 확인 모달 ---
// const ConfirmModal = ({
//   isOpen,
//   onConfirm,
//   onCancel,
//   nickname,
// }: {
//   isOpen: boolean;
//   onConfirm: () => void;
//   onCancel: () => void;
//   nickname: string;
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-gray-700 rounded-lg p-6 shadow-xl w-full max-w-sm">
//         <h3 className="text-lg font-bold text-white">사용자 차단</h3>
//         <p className="text-sm text-gray-300 mt-2">
//           정말로{" "}
//           <span className="font-semibold text-purple-400">{nickname}</span>님을
//           차단하시겠습니까? <br />
//           차단하면 이 사용자의 메시지가 더 이상 보이지 않습니다.
//         </p>
//         <div className="mt-6 flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
//           >
//             취소
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
//           >
//             차단
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ChatPanel = ({ messages, sendMessage, onBlockUser }: ChatPanelProps) => {
//   const { myUser } = useUserStore();
//   const [newMessage, setNewMessage] = useState("");

//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const listRef = useRef<HTMLDivElement | null>(null);
//   const inputRef = useRef<HTMLTextAreaElement | null>(null);
//   const sentByPointerRef = useRef(false);
//   const isAtBottomRef = useRef(true);
//   const prevLenRef = useRef(0);

//   const [lastUnread, setLastUnread] = useState<ChatMessage | null>(null);

//   // 차단 확인 모달
//   const [blockConfirm, setBlockConfirm] = useState<{
//     isOpen: boolean;
//     user: { id: string; nickname: string } | null;
//   }>({ isOpen: false, user: null });

//   const [atBottom, setAtBottom] = useState(true);
//   const footerRef = useRef<HTMLDivElement | null>(null);
//   const [footerH, setFooterH] = useState(0);
//   const [isMultiline, setIsMultiline] = useState(false);

//   // ✅ 도배 감지용
//   const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
//   const pendingSendRef = useRef<{ content: string; at: number } | null>(null);
//   const lastMsgCountRef = useRef<number>(messages.length);

//   // footer 높이 추적
//   useEffect(() => {
//     const el = footerRef.current;
//     if (!el) return;
//     const update = () => setFooterH(el.offsetHeight);
//     const ro = new ResizeObserver(update);
//     ro.observe(el);
//     update();
//     return () => ro.disconnect();
//   }, []);

//   const calcIsAtBottom = (el: HTMLElement) => {
//     const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
//     return gap <= 100;
//   };

//   const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
//     messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
//   };

//   const onScroll = () => {
//     const el = listRef.current;
//     if (!el) return;
//     const atBottomNow = calcIsAtBottom(el);
//     isAtBottomRef.current = atBottomNow;
//     setAtBottom(atBottomNow);

//     if (atBottomNow && lastUnread) {
//       setLastUnread(null);
//     }
//   };

//   // 메시지 들어올 때 처리
//   useEffect(() => {
//     const addedCount = messages.length - prevLenRef.current;

//     if (addedCount > 0) {
//       const last = messages[messages.length - 1];
//       const isSystem = (last as any)?.chatType === "ENTER";
//       if (!last || isSystem) {
//         prevLenRef.current = messages.length;
//         return;
//       }

//       const fromMe =
//         String(last?.senderId ?? "") === String(myUser?.userId ?? "");

//       requestAnimationFrame(() => {
//         requestAnimationFrame(() => {
//           const el = listRef.current;
//           if (!el) return;

//           const wasAtBottom = calcIsAtBottom(el);
//           isAtBottomRef.current = wasAtBottom;
//           setAtBottom(wasAtBottom);

//           if (fromMe || wasAtBottom) {
//             scrollToBottom(fromMe ? "auto" : "smooth");
//             setLastUnread(null);
//           } else {
//             setLastUnread(last);
//           }
//         });
//       });
//     }

//     prevLenRef.current = messages.length;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [messages.length, myUser?.userId]);

//   // 첫 로드시 맨 아래로
//   useEffect(() => {
//     setTimeout(() => {
//       scrollToBottom("auto");
//       setAtBottom(true);
//       isAtBottomRef.current = true;
//     }, 100);
//   }, []);

//   // textarea 자동 리사이즈
//   const autoResize = () => {
//     const el = inputRef.current;
//     if (!el) return;
//     const MAX_H = 160;
//     el.style.height = "auto";
//     const h = Math.min(el.scrollHeight, MAX_H);
//     el.style.height = `${h}px`;
//     el.style.overflowY = el.scrollHeight > MAX_H ? "auto" : "hidden";
//     setIsMultiline(h > 48);
//   };

//   useEffect(() => {
//     autoResize();
//   }, [newMessage]);

//   // ✅ 도배 감지: 메시지 실제 도착 확인
//   useEffect(() => {
//     const pending = pendingSendRef.current;
//     if (!pending) {
//       lastMsgCountRef.current = messages.length;
//       return;
//     }

//     const last = messages[messages.length - 1];
//     if (
//       last &&
//       myUser?.userId &&
//       String(last.senderId) === String(myUser.userId) &&
//       last.content === pending.content
//     ) {
//       // 서버가 받아줌
//       pendingSendRef.current = null;
//       lastMsgCountRef.current = messages.length;
//       return;
//     }

//     // 게스트일 때는 일단 개수만 갱신
//     lastMsgCountRef.current = messages.length;
//   }, [messages, myUser?.userId]);

//   // ✅ 배너 띄우는 공통 함수
//   const triggerRateLimited = (ms = 5000) => {
//     const now = Date.now();
//     // 다시 누르면 시간 리셋
//     setRateLimitedUntil(now + ms);
//   };

//   const handleSendMessage = () => {
//     const v = newMessage.trim();
//     if (!v) return;
//     if (countGraphemes(newMessage) > MAX_LEN) return;

//     const now = Date.now();
//     const isRateLimitedNow =
//       rateLimitedUntil !== null && now < rateLimitedUntil;

//     // ✅ 이미 막혀있는 상태에서 또 누르면 바로 배너만 다시 보여주고 끝
//     if (isRateLimitedNow) {
//       triggerRateLimited(); // 시간 리셋해서 계속 보이게
//       return;
//     }

//     // 전송 직후 "보냈다" 기록
//     const sentAt = Date.now();
//     pendingSendRef.current = { content: v, at: sentAt };

//     const maybePromise = sendMessage(v);
//     setNewMessage("");

//     // 포커스/스크롤
//     requestAnimationFrame(() => {
//       scrollToBottom("auto");
//       setAtBottom(true);
//       isAtBottomRef.current = true;
//       const el = inputRef.current;
//       if (el) {
//         el.style.height = "auto";
//         el.style.overflowY = "hidden";
//         el.focus({ preventScroll: true });
//       }
//     });

//     // 혹시 진짜로 에러를 던져주면 그걸로도 감지
//     Promise.resolve(maybePromise).catch((err) => {
//       const type =
//         (err as any)?.response?.data?.type || (err as any)?.type || "";
//       if (type === "CHAT_RATE_LIMITED" || (err as any)?.status === 429) {
//         triggerRateLimited();
//         pendingSendRef.current = null;
//       }
//     });

//     // 100ms 안에 메시지가 안 돌아오면 "막혔다"라고 거의 즉시 판단
//     setTimeout(() => {
//       const pendingNow = pendingSendRef.current;
//       if (!pendingNow) return;
//       if (pendingNow.at === sentAt) {
//         // 여전히 안 왔다 → 막힌 걸로 본다
//         triggerRateLimited();
//         pendingSendRef.current = null;
//       }
//     }, 100);
//   };

//   // 차단 모달 열기
//   const openBlockConfirm = (user: { id: string; nickname: string }) => {
//     setBlockConfirm({ isOpen: true, user });
//   };

//   // 차단 확정
//   const confirmBlock = async () => {
//     if (!blockConfirm.user) return;
//     const id = blockConfirm.user.id;

//     onBlockUser(id);
//     try {
//       const res = await blockUser(id);
//       console.log(res.message);
//     } catch (err) {
//       console.error("차단 실패:", err);
//     } finally {
//       setBlockConfirm({ isOpen: false, user: null });
//     }
//   };

//   const charCount = countGraphemes(newMessage);
//   const overLimit = charCount > MAX_LEN;

//   const previewContent = (m: ChatMessage | null) => {
//     if (!m) return "";
//     if ((m as any).isImage) return "[GIF]";
//     return previewGraphemes(m.content ?? "", 10);
//   };

//   const isRateLimitedNow =
//     rateLimitedUntil !== null && Date.now() < rateLimitedUntil;

//   return (
//     <>
//       <ConfirmModal
//         isOpen={blockConfirm.isOpen}
//         onConfirm={confirmBlock}
//         onCancel={() => setBlockConfirm({ isOpen: false, user: null })}
//         nickname={blockConfirm.user?.nickname ?? ""}
//       />

//       <div className="relative flex flex-col h-full bg-gray-800 text-white">
//         {/* ✅ 도배 안내 말풍선: 채팅창 바로 위에, 한 줄, 크게 */}
//         {isRateLimitedNow && (
//           <div
//             className="absolute left-1/2 -translate-x-1/2 z-[300] transition-opacity"
//             style={{
//               bottom: (footerH || 88) + 12,
//               maxWidth: "92%",
//             }}
//           >
//             <div className="bg-red-500 text-white text-sm md:text-base px-5 py-2 rounded-2xl shadow-lg border border-red-300 flex items-center gap-2 whitespace-nowrap justify-center">
//               ⚠️ 채팅 도배로 5초간 채팅이 제한됩니다.
//             </div>
//           </div>
//         )}

//         {/* 메시지 목록 */}
//         <div
//           ref={listRef}
//           onScroll={onScroll}
//           className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 min-h-0"
//           style={{
//             paddingBottom: 8,
//             scrollPaddingBottom: (footerH || 88) + 8,
//             scrollbarGutter: "stable both-edges" as any,
//           }}
//         >
//           {messages.map((msg, index) => {
//             if ((msg as any).chatType === "ENTER") {
//               return (
//                 <div
//                   key={`system-${index}`}
//                   className="text-center text-xs text-gray-500 py-1"
//                 >
//                   {msg.content}
//                 </div>
//               );
//             }

//             const uniqueKey = `${msg.senderId}-${(msg as any).sentAt || index}`;
//             const isMyMessage =
//               String(msg.senderId ?? "") === String(myUser?.userId ?? "");

//             return (
//               <div
//                 key={uniqueKey}
//                 className={`flex flex-col ${
//                   isMyMessage ? "items-end" : "items-start"
//                 }`}
//               >
//                 <span className="text-xs text-gray-500 mb-1">
//                   {msg.senderNickName}
//                 </span>

//                 <div
//                   className={`group relative flex items-end gap-2 max-w-[85%] ${
//                     isMyMessage ? "flex-row-reverse" : "flex-row"
//                   }`}
//                 >
//                   {(msg as any).isImage ? (
//                     <div className="relative">
//                       <img
//                         src={msg.content}
//                         alt="gif"
//                         className="rounded-2xl border border-black/5
//                                   max-w-full sm:max-w-[240px] max-h-[240px]
//                                   object-contain block"
//                         style={{
//                           width: "100%",
//                           height: "auto",
//                         }}
//                         loading="lazy"
//                         onLoad={() => scrollToBottom("auto")}
//                         onError={(e) => {
//                           (e.currentTarget as HTMLImageElement).style.display =
//                             "none";
//                         }}
//                       />
//                       {!isMyMessage && (
//                         <Popover className="absolute top-1 right-1">
//                           <Popover.Button className="p-0.5 rounded-full bg-black/30 hover:bg-black/50 focus:outline-none">
//                             <MoreVertical size={14} className="text-white" />
//                           </Popover.Button>
//                           <Transition
//                             enter="transition duration-100 ease-out"
//                             enterFrom="transform scale-95 opacity-0"
//                             enterTo="transform scale-100 opacity-100"
//                             leave="transition duration-75 ease-out"
//                             leaveFrom="transform scale-100 opacity-100"
//                             leaveTo="transform scale-95 opacity-0"
//                           >
//                             <Popover.Panel className="absolute z-10 top-0 left-full ml-2 w-40 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
//                               <div className="flex flex-col p-1">
//                                 <button
//                                   onClick={() =>
//                                     openBlockConfirm({
//                                       id: msg.senderId,
//                                       nickname: msg.senderNickName,
//                                     })
//                                   }
//                                   className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
//                                 >
//                                   <UserX size={14} />
//                                   <span className="whitespace-nowrap">
//                                     차단하기
//                                   </span>
//                                 </button>
//                               </div>
//                             </Popover.Panel>
//                           </Transition>
//                         </Popover>
//                       )}
//                     </div>
//                   ) : (
//                     <div
//                       className={`relative group px-4 py-2 rounded-lg text-sm ${
//                         isMyMessage ? "bg-purple-600" : "bg-gray-700"
//                       } break-all`}
//                     >
//                       <span className={!isMyMessage ? "pr-5" : ""}>
//                         {msg.content}
//                       </span>

//                       {!isMyMessage && (
//                         <Popover className="absolute top-1 right-1">
//                           <Popover.Button className="p-0.5 rounded-full hover:bg-black/20 focus:outline-none">
//                             <MoreVertical size={14} className="text-white" />
//                           </Popover.Button>
//                           <Transition
//                             enter="transition duration-100 ease-out"
//                             enterFrom="transform scale-95 opacity-0"
//                             enterTo="transform scale-100 opacity-100"
//                             leave="transition duration-75 ease-out"
//                             leaveFrom="transform scale-100 opacity-100"
//                             leaveTo="transform scale-95 opacity-0"
//                           >
//                             <Popover.Panel className="absolute z-10 top-0 left-full ml-2 w-40 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
//                               <div className="flex flex-col p-1">
//                                 <button
//                                   onClick={() =>
//                                     openBlockConfirm({
//                                       id: msg.senderId,
//                                       nickname: msg.senderNickName,
//                                     })
//                                   }
//                                   className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
//                                 >
//                                   <UserX size={14} />
//                                   <span className="whitespace-nowrap">
//                                     차단하기
//                                   </span>
//                                 </button>
//                               </div>
//                             </Popover.Panel>
//                           </Transition>
//                         </Popover>
//                       )}
//                     </div>
//                   )}

//                   <span className="text-xs text-gray-500 whitespace-nowrap">
//                     {new Date((msg as any).sentAt).toLocaleTimeString("ko-KR", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                 </div>
//               </div>
//             );
//           })}

//           <div
//             ref={messagesEndRef}
//             style={{ scrollMarginBottom: (footerH || 88) + 8 }}
//           />
//         </div>

//         {/* 새 메시지 배지 */}
//         {lastUnread && !atBottom && (
//           <div
//             onClick={() => {
//               setLastUnread(null);
//               scrollToBottom("smooth");
//               setAtBottom(true);
//               isAtBottomRef.current = true;
//             }}
//             className="absolute left-1/2 -translate-x-1/2 z-[200] cursor-pointer"
//             style={{
//               bottom: (footerH || 88) + 8,
//               paddingBottom: "env(safe-area-inset-bottom)",
//             }}
//           >
//             <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-3 py-2">
//               <div className="flex items-center gap-2 max-w-[280px]">
//                 <span className="text-gray-900 text-sm font-semibold shrink-0">
//                   {previewGraphemes(lastUnread.senderNickName ?? "", 7)}
//                 </span>
//                 <span className="text-gray-800 text-sm truncate">
//                   {previewContent(lastUnread)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 입력 영역 */}
//         <div
//           ref={footerRef}
//           className="p-3 border-t border-gray-700 bg-gray-800/80"
//         >
//           <div
//             className={`rounded-lg border bg-gray-700 transition-colors
//                         ${
//                           overLimit
//                             ? "border-red-500"
//                             : "border-gray-600 focus-within:border-purple-500"
//                         } ${isRateLimitedNow ? "opacity-70" : ""}`}
//           >
//             <div
//               className={`flex ${
//                 isMultiline ? "items-end" : "items-center"
//               } gap-2 px-3 py-2`}
//             >
//               <textarea
//                 ref={inputRef}
//                 rows={1}
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onInput={autoResize}
//                 onKeyDown={(e) => {
//                   // @ts-ignore
//                   if (
//                     e.key === "Enter" &&
//                     !e.shiftKey &&
//                     !e.nativeEvent?.isComposing
//                   ) {
//                     e.preventDefault();
//                     if (!overLimit) handleSendMessage();
//                   }
//                 }}
//                 placeholder={
//                   isRateLimitedNow
//                     ? "채팅 도배로 잠시 제한되었습니다."
//                     : myUser
//                     ? "메시지를 입력하세요..."
//                     : "게스트로 채팅하기..."
//                 }
//                 className="flex-1 bg-transparent border-0 outline-none resize-none max-h-40
//                           text-base md:text-sm leading-6 placeholder:text-gray-400
//                           focus:ring-0 p-0"
//                 disabled={isRateLimitedNow}
//               />

//               <button
//                 type="button"
//                 tabIndex={-1}
//                 onPointerDown={(e) => {
//                   e.preventDefault();
//                 }}
//                 onPointerUp={(e) => {
//                   e.preventDefault();
//                   sentByPointerRef.current = true;
//                   if (!overLimit) handleSendMessage();
//                 }}
//                 onClick={(e) => {
//                   if (sentByPointerRef.current) {
//                     sentByPointerRef.current = false;
//                     return;
//                   }
//                   e.preventDefault();
//                   if (!overLimit) handleSendMessage();
//                 }}
//                 disabled={!newMessage.trim() || overLimit || isRateLimitedNow}
//                 className="h-9 w-9 rounded-full flex items-center justify-center
//                           bg-gray-600 hover:bg-gray-500 transition-colors
//                           disabled:bg-gray-700 disabled:cursor-not-allowed
//                           shrink-0"
//                 aria-label="메시지 전송"
//               >
//                 <Send size={18} className="text-white" />
//               </button>
//             </div>
//           </div>

//           <div className="mt-1 flex justify-end">
//             <span
//               className={`text-xs ${
//                 overLimit ? "text-red-400" : "text-gray-400"
//               }`}
//             >
//               {charCount}/{MAX_LEN}
//               {overLimit ? " (최대 초과)" : ""}
//             </span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ChatPanel;

// import { useState, useEffect, useRef } from "react";
// import { Send, MoreVertical, UserX } from "lucide-react";
// import { Popover, Transition } from "@headlessui/react";
// import { useUserStore } from "../../store/useUserStore";
// import type { ChatMessage } from "../../types/chat";
// import { blockUser } from "../../api/userService";

// type ChatPanelProps = {
//   messages: ChatMessage[];
//   sendMessage: (content: string) => Promise<void> | void;
//   onBlockUser: (userId: string) => void;
// };

// // 최근 메시지/이름 미리보기
// function previewGraphemes(s: string, limit: number): string {
//   if (!s) return "";
//   // @ts-ignore
//   if (typeof Intl !== "undefined" && Intl.Segmenter) {
//     // @ts-ignore
//     const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
//     const parts = Array.from(seg.segment(s)).map((p: any) => p.segment);
//     return parts.length > limit ? parts.slice(0, limit).join("") + "…" : s;
//   }
//   return s.length > limit ? s.slice(0, limit) + "…" : s;
// }

// function countGraphemes(s: string): number {
//   if (!s) return 0;
//   // @ts-ignore
//   if (typeof Intl !== "undefined" && Intl.Segmenter) {
//     // @ts-ignore
//     const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
//     return Array.from(seg.segment(s)).length;
//   }
//   return [...s].length;
// }

// const MAX_LEN = 500;

// // --- 차단 확인 모달 ---
// const ConfirmModal = ({
//   isOpen,
//   onConfirm,
//   onCancel,
//   nickname,
// }: {
//   isOpen: boolean;
//   onConfirm: () => void;
//   onCancel: () => void;
//   nickname: string;
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-gray-700 rounded-lg p-6 shadow-xl w-full max-w-sm">
//         <h3 className="text-lg font-bold text-white">사용자 차단</h3>
//         <p className="text-sm text-gray-300 mt-2">
//           정말로{" "}
//           <span className="font-semibold text-purple-400">{nickname}</span>님을
//           차단하시겠습니까? <br />
//           차단하면 이 사용자의 메시지가 더 이상 보이지 않습니다.
//         </p>
//         <div className="mt-6 flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
//           >
//             취소
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
//           >
//             차단
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ChatPanel = ({ messages, sendMessage, onBlockUser }: ChatPanelProps) => {
//   const { myUser } = useUserStore();
//   const [newMessage, setNewMessage] = useState("");

//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const listRef = useRef<HTMLDivElement | null>(null);
//   const inputRef = useRef<HTMLTextAreaElement | null>(null);
//   const sentByPointerRef = useRef(false);
//   const isAtBottomRef = useRef(true);
//   const prevLenRef = useRef(0);

//   const [lastUnread, setLastUnread] = useState<ChatMessage | null>(null);

//   // 차단 확인 모달
//   const [blockConfirm, setBlockConfirm] = useState<{
//     isOpen: boolean;
//     user: { id: string; nickname: string } | null;
//   }>({ isOpen: false, user: null });

//   const [atBottom, setAtBottom] = useState(true);
//   const footerRef = useRef<HTMLDivElement | null>(null);
//   const [footerH, setFooterH] = useState(0);
//   const [isMultiline, setIsMultiline] = useState(false);

//   // ✅ 도배 감지용
//   const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
//   const pendingSendRef = useRef<{ content: string; at: number } | null>(null);
//   const lastMsgCountRef = useRef<number>(messages.length);

//   // footer 높이 추적
//   useEffect(() => {
//     const el = footerRef.current;
//     if (!el) return;
//     const update = () => setFooterH(el.offsetHeight);
//     const ro = new ResizeObserver(update);
//     ro.observe(el);
//     update();
//     return () => ro.disconnect();
//   }, []);

//   const calcIsAtBottom = (el: HTMLElement) => {
//     const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
//     return gap <= 100;
//   };

//   const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
//     messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
//   };

//   const onScroll = () => {
//     const el = listRef.current;
//     if (!el) return;
//     const atBottomNow = calcIsAtBottom(el);
//     isAtBottomRef.current = atBottomNow;
//     setAtBottom(atBottomNow);

//     if (atBottomNow && lastUnread) {
//       setLastUnread(null);
//     }
//   };

//   // 메시지 들어올 때 처리
//   useEffect(() => {
//     const addedCount = messages.length - prevLenRef.current;

//     if (addedCount > 0) {
//       const last = messages[messages.length - 1];
//       const isSystem = (last as any)?.chatType === "ENTER";
//       if (!last || isSystem) {
//         prevLenRef.current = messages.length;
//         return;
//       }

//       const fromMe =
//         String(last?.senderId ?? "") === String(myUser?.userId ?? "");

//       requestAnimationFrame(() => {
//         requestAnimationFrame(() => {
//           const el = listRef.current;
//           if (!el) return;

//           const wasAtBottom = calcIsAtBottom(el);
//           isAtBottomRef.current = wasAtBottom;
//           setAtBottom(wasAtBottom);

//           if (fromMe || wasAtBottom) {
//             scrollToBottom(fromMe ? "auto" : "smooth");
//             setLastUnread(null);
//           } else {
//             setLastUnread(last);
//           }
//         });
//       });
//     }

//     prevLenRef.current = messages.length;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [messages.length, myUser?.userId]);

//   // 첫 로드시 맨 아래로
//   useEffect(() => {
//     setTimeout(() => {
//       scrollToBottom("auto");
//       setAtBottom(true);
//       isAtBottomRef.current = true;
//     }, 100);
//   }, []);

//   // textarea 자동 리사이즈
//   const autoResize = () => {
//     const el = inputRef.current;
//     if (!el) return;
//     const MAX_H = 160;
//     el.style.height = "auto";
//     const h = Math.min(el.scrollHeight, MAX_H);
//     el.style.height = `${h}px`;
//     el.style.overflowY = el.scrollHeight > MAX_H ? "auto" : "hidden";
//     setIsMultiline(h > 48);
//   };

//   useEffect(() => {
//     autoResize();
//   }, [newMessage]);

//   // ✅ 도배 감지: 메시지 실제 도착 확인
//   useEffect(() => {
//     const pending = pendingSendRef.current;
//     if (!pending) {
//       lastMsgCountRef.current = messages.length;
//       return;
//     }

//     const last = messages[messages.length - 1];
//     if (
//       last &&
//       myUser?.userId &&
//       String(last.senderId) === String(myUser.userId) &&
//       last.content === pending.content
//     ) {
//       // 서버가 받아줌
//       pendingSendRef.current = null;
//       lastMsgCountRef.current = messages.length;
//       return;
//     }

//     // 게스트일 때는 일단 개수만 갱신
//     lastMsgCountRef.current = messages.length;
//   }, [messages, myUser?.userId]);

//   // ✅ 배너 띄우는 공통 함수
//   const triggerRateLimited = (ms = 5000) => {
//     const now = Date.now();
//     // 다시 누르면 시간 리셋
//     setRateLimitedUntil(now + ms);
//   };

//   const handleSendMessage = () => {
//     const v = newMessage.trim();
//     if (!v) return;
//     if (countGraphemes(newMessage) > MAX_LEN) return;

//     const now = Date.now();
//     const isRateLimitedNow =
//       rateLimitedUntil !== null && now < rateLimitedUntil;

//     // ✅ 이미 막혀있는 상태에서 또 누르면 바로 배너만 다시 보여주고 끝
//     if (isRateLimitedNow) {
//       triggerRateLimited(); // 시간 리셋해서 계속 보이게
//       return;
//     }

//     // 전송 직후 "보냈다" 기록
//     const sentAt = Date.now();
//     pendingSendRef.current = { content: v, at: sentAt };

//     const maybePromise = sendMessage(v);
//     setNewMessage("");

//     // 포커스/스크롤
//     requestAnimationFrame(() => {
//       scrollToBottom("auto");
//       setAtBottom(true);
//       isAtBottomRef.current = true;
//       const el = inputRef.current;
//       if (el) {
//         el.style.height = "auto";
//         el.style.overflowY = "hidden";
//         el.focus({ preventScroll: true });
//       }
//     });

//     // 혹시 진짜로 에러를 던져주면 그걸로도 감지
//     Promise.resolve(maybePromise).catch((err) => {
//       const type =
//         (err as any)?.response?.data?.type || (err as any)?.type || "";
//       if (type === "CHAT_RATE_LIMITED" || (err as any)?.status === 429) {
//         triggerRateLimited();
//         pendingSendRef.current = null;
//       }
//     });

//     // 100ms 안에 메시지가 안 돌아오면 "막혔다"라고 거의 즉시 판단
//     setTimeout(() => {
//       const pendingNow = pendingSendRef.current;
//       if (!pendingNow) return;
//       if (pendingNow.at === sentAt) {
//         // 여전히 안 왔다 → 막힌 걸로 본다
//         triggerRateLimited();
//         pendingSendRef.current = null;
//       }
//     }, 100);
//   };

//   // 차단 모달 열기
//   const openBlockConfirm = (user: { id: string; nickname: string }) => {
//     setBlockConfirm({ isOpen: true, user });
//   };

//   // 차단 확정
//   const confirmBlock = async () => {
//     if (!blockConfirm.user) return;
//     const id = blockConfirm.user.id;

//     onBlockUser(id);
//     try {
//       const res = await blockUser(id);
//       console.log(res.message);
//     } catch (err) {
//       console.error("차단 실패:", err);
//     } finally {
//       setBlockConfirm({ isOpen: false, user: null });
//     }
//   };

//   const charCount = countGraphemes(newMessage);
//   const overLimit = charCount > MAX_LEN;

//   const previewContent = (m: ChatMessage | null) => {
//     if (!m) return "";
//     if ((m as any).isImage) return "[GIF]";
//     return previewGraphemes(m.content ?? "", 10);
//   };

//   const isRateLimitedNow =
//     rateLimitedUntil !== null && Date.now() < rateLimitedUntil;

//   return (
//     <>
//       <ConfirmModal
//         isOpen={blockConfirm.isOpen}
//         onConfirm={confirmBlock}
//         onCancel={() => setBlockConfirm({ isOpen: false, user: null })}
//         nickname={blockConfirm.user?.nickname ?? ""}
//       />

//       <div className="relative flex flex-col h-full bg-gray-800 text-white">
//         {/* ✅ 도배 안내 말풍선: 채팅창 바로 위에, 한 줄, 크게 */}
//         {isRateLimitedNow && (
//           <div
//             className="absolute left-1/2 -translate-x-1/2 z-[300] transition-opacity"
//             style={{
//               bottom: (footerH || 88) + 12,
//               maxWidth: "92%",
//             }}
//           >
//             <div className="bg-red-500 text-white text-sm md:text-base px-5 py-2 rounded-2xl shadow-lg border border-red-300 flex items-center gap-2 whitespace-nowrap justify-center">
//               ⚠️ 채팅 도배로 5초간 채팅이 제한됩니다.
//             </div>
//           </div>
//         )}

//         {/* 메시지 목록 */}
//         <div
//           ref={listRef}
//           onScroll={onScroll}
//           className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 min-h-0"
//           style={{
//             paddingBottom: 8,
//             scrollPaddingBottom: (footerH || 88) + 8,
//             scrollbarGutter: "stable both-edges" as any,
//           }}
//         >
//           {messages.map((msg, index) => {
//             if ((msg as any).chatType === "ENTER") {
//               return (
//                 <div
//                   key={`system-${index}`}
//                   className="text-center text-xs text-gray-500 py-1"
//                 >
//                   {msg.content}
//                 </div>
//               );
//             }

//             const uniqueKey = `${msg.senderId}-${(msg as any).sentAt || index}`;
//             const isMyMessage =
//               String(msg.senderId ?? "") === String(myUser?.userId ?? "");

//             return (
//               <div
//                 key={uniqueKey}
//                 className={`flex flex-col ${
//                   isMyMessage ? "items-end" : "items-start"
//                 }`}
//               >
//                 <span className="text-xs text-gray-500 mb-1">
//                   {msg.senderNickName}
//                 </span>

//                 <div
//                   className={`group relative flex items-end gap-2 max-w-[85%] ${
//                     isMyMessage ? "flex-row-reverse" : "flex-row"
//                   }`}
//                 >
//                   {(msg as any).isImage ? (
//                     <div className="relative">
//                       <img
//                         src={msg.content}
//                         alt="gif"
//                         className="rounded-2xl border border-black/5
//                                   max-w-full sm:max-w-[240px] max-h-[240px]
//                                   object-contain block"
//                         style={{
//                           width: "100%",
//                           height: "auto",
//                         }}
//                         loading="lazy"
//                         onLoad={() => scrollToBottom("auto")}
//                         onError={(e) => {
//                           (e.currentTarget as HTMLImageElement).style.display =
//                             "none";
//                         }}
//                       />
//                       {!isMyMessage && (
//                         <Popover className="absolute top-1 right-1">
//                           <Popover.Button className="p-0.5 rounded-full bg-black/30 hover:bg-black/50 focus:outline-none">
//                             <MoreVertical size={14} className="text-white" />
//                           </Popover.Button>
//                           <Transition
//                             enter="transition duration-100 ease-out"
//                             enterFrom="transform scale-95 opacity-0"
//                             enterTo="transform scale-100 opacity-100"
//                             leave="transition duration-75 ease-out"
//                             leaveFrom="transform scale-100 opacity-100"
//                             leaveTo="transform scale-95 opacity-0"
//                           >
//                             <Popover.Panel className="absolute z-10 top-0 left-full ml-2 w-40 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
//                               <div className="flex flex-col p-1">
//                                 <button
//                                   onClick={() =>
//                                     openBlockConfirm({
//                                       id: msg.senderId,
//                                       nickname: msg.senderNickName,
//                                     })
//                                   }
//                                   className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
//                                 >
//                                   <UserX size={14} />
//                                   <span className="whitespace-nowrap">
//                                     차단하기
//                                   </span>
//                                 </button>
//                               </div>
//                             </Popover.Panel>
//                           </Transition>
//                         </Popover>
//                       )}
//                     </div>
//                   ) : (
//                     <div
//                       className={`relative group px-4 py-2 rounded-lg text-sm ${
//                         isMyMessage ? "bg-purple-600" : "bg-gray-700"
//                       } break-all`}
//                     >
//                       <span className={!isMyMessage ? "pr-5" : ""}>
//                         {msg.content}
//                       </span>

//                       {!isMyMessage && (
//                         <Popover className="absolute top-1 right-1">
//                           <Popover.Button className="p-0.5 rounded-full hover:bg-black/20 focus:outline-none">
//                             <MoreVertical size={14} className="text-white" />
//                           </Popover.Button>
//                           <Transition
//                             enter="transition duration-100 ease-out"
//                             enterFrom="transform scale-95 opacity-0"
//                             enterTo="transform scale-100 opacity-100"
//                             leave="transition duration-75 ease-out"
//                             leaveFrom="transform scale-100 opacity-100"
//                             leaveTo="transform scale-95 opacity-0"
//                           >
//                             <Popover.Panel className="absolute z-10 top-0 left-full ml-2 w-40 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
//                               <div className="flex flex-col p-1">
//                                 <button
//                                   onClick={() =>
//                                     openBlockConfirm({
//                                       id: msg.senderId,
//                                       nickname: msg.senderNickName,
//                                     })
//                                   }
//                                   className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
//                                 >
//                                   <UserX size={14} />
//                                   <span className="whitespace-nowrap">
//                                     차단하기
//                                   </span>
//                                 </button>
//                               </div>
//                             </Popover.Panel>
//                           </Transition>
//                         </Popover>
//                       )}
//                     </div>
//                   )}

//                   <span className="text-xs text-gray-500 whitespace-nowrap">
//                     {new Date((msg as any).sentAt).toLocaleTimeString("ko-KR", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                 </div>
//               </div>
//             );
//           })}

//           <div
//             ref={messagesEndRef}
//             style={{ scrollMarginBottom: (footerH || 88) + 8 }}
//           />
//         </div>

//         {/* 새 메시지 배지 */}
//         {lastUnread && !atBottom && (
//           <div
//             onClick={() => {
//               setLastUnread(null);
//               scrollToBottom("smooth");
//               setAtBottom(true);
//               isAtBottomRef.current = true;
//             }}
//             className="absolute left-1/2 -translate-x-1/2 z-[200] cursor-pointer"
//             style={{
//               bottom: (footerH || 88) + 8,
//               paddingBottom: "env(safe-area-inset-bottom)",
//             }}
//           >
//             <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-3 py-2">
//               <div className="flex items-center gap-2 max-w-[280px]">
//                 <span className="text-gray-900 text-sm font-semibold shrink-0">
//                   {previewGraphemes(lastUnread.senderNickName ?? "", 7)}
//                 </span>
//                 <span className="text-gray-800 text-sm truncate">
//                   {previewContent(lastUnread)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 입력 영역 */}
//         <div
//           ref={footerRef}
//           className="p-3 border-t border-gray-700 bg-gray-800/80"
//         >
//           <div
//             className={`rounded-lg border bg-gray-700 transition-colors
//                         ${
//                           overLimit
//                             ? "border-red-500"
//                             : "border-gray-600 focus-within:border-purple-500"
//                         } ${isRateLimitedNow ? "opacity-70" : ""}`}
//           >
//             <div
//               className={`flex ${
//                 isMultiline ? "items-end" : "items-center"
//               } gap-2 px-3 py-2`}
//             >
//               <textarea
//                 ref={inputRef}
//                 rows={1}
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onInput={autoResize}
//                 onKeyDown={(e) => {
//                   // @ts-ignore
//                   if (
//                     e.key === "Enter" &&
//                     !e.shiftKey &&
//                     !e.nativeEvent?.isComposing
//                   ) {
//                     e.preventDefault();
//                     if (!overLimit) handleSendMessage();
//                   }
//                 }}
//                 placeholder={
//                   isRateLimitedNow
//                     ? "채팅 도배로 잠시 제한되었습니다."
//                     : myUser
//                     ? "메시지를 입력하세요..."
//                     : "게스트로 채팅하기..."
//                 }
//                 className="flex-1 bg-transparent border-0 outline-none resize-none max-h-40
//                           text-base md:text-sm leading-6 placeholder:text-gray-400
//                           focus:ring-0 p-0"
//                 disabled={isRateLimitedNow}
//               />

//               <button
//                 type="button"
//                 tabIndex={-1}
//                 onPointerDown={(e) => {
//                   e.preventDefault();
//                 }}
//                 onPointerUp={(e) => {
//                   e.preventDefault();
//                   sentByPointerRef.current = true;
//                   if (!overLimit) handleSendMessage();
//                 }}
//                 onClick={(e) => {
//                   if (sentByPointerRef.current) {
//                     sentByPointerRef.current = false;
//                     return;
//                   }
//                   e.preventDefault();
//                   if (!overLimit) handleSendMessage();
//                 }}
//                 disabled={!newMessage.trim() || overLimit || isRateLimitedNow}
//                 className="h-9 w-9 rounded-full flex items-center justify-center
//                           bg-gray-600 hover:bg-gray-500 transition-colors
//                           disabled:bg-gray-700 disabled:cursor-not-allowed
//                           shrink-0"
//                 aria-label="메시지 전송"
//               >
//                 <Send size={18} className="text-white" />
//               </button>
//             </div>
//           </div>

//           <div className="mt-1 flex justify-end">
//             <span
//               className={`text-xs ${
//                 overLimit ? "text-red-400" : "text-gray-400"
//               }`}
//             >
//               {charCount}/{MAX_LEN}
//               {overLimit ? " (최대 초과)" : ""}
//             </span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ChatPanel;

import { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, UserX } from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import { useUserStore } from "../../store/useUserStore";
import type { ChatMessage } from "../../types/chat";
import { blockUser } from "../../api/userService";

type ChatPanelProps = {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void> | void;
  onBlockUser: (userId: string) => void;
};

// 최근 메시지/이름 미리보기
function previewGraphemes(s: string, limit: number): string {
  if (!s) return "";
  // @ts-ignore
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    // @ts-ignore
    const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
    const parts = Array.from(seg.segment(s)).map((p: any) => p.segment);
    return parts.length > limit ? parts.slice(0, limit).join("") + "…" : s;
  }
  return s.length > limit ? s.slice(0, limit) + "…" : s;
}

function countGraphemes(s: string): number {
  if (!s) return 0;
  // @ts-ignore
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    // @ts-ignore
    const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
    return Array.from(seg.segment(s)).length;
  }
  return [...s].length;
}

const MAX_LEN = 500;

// --- 차단 확인 모달 ---
const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  nickname,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  nickname: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-700 rounded-lg p-6 shadow-xl w-full max-w-sm">
        <h3 className="text-lg font-bold text-white">사용자 차단</h3>
        <p className="text-sm text-gray-300 mt-2">
          정말로{" "}
          <span className="font-semibold text-purple-400">{nickname}</span>님을
          차단하시겠습니까? <br />
          차단하면 이 사용자의 메시지가 더 이상 보이지 않습니다.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            차단
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatPanel = ({ messages, sendMessage, onBlockUser }: ChatPanelProps) => {
  const { myUser } = useUserStore();
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const sentByPointerRef = useRef(false);
  const isAtBottomRef = useRef(true);
  const prevLenRef = useRef(0);

  const [lastUnread, setLastUnread] = useState<ChatMessage | null>(null);

  // 차단 확인 모달
  const [blockConfirm, setBlockConfirm] = useState<{
    isOpen: boolean;
    user: { id: string; nickname: string } | null;
  }>({ isOpen: false, user: null });

  const [atBottom, setAtBottom] = useState(true);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerH, setFooterH] = useState(0);
  const [isMultiline, setIsMultiline] = useState(false);

  // ✅ 도배 감지용
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const pendingSendRef = useRef<{ content: string; at: number } | null>(null);
  const lastMsgCountRef = useRef<number>(messages.length);

  const isLoggedIn = !!myUser?.userId; // ← 이게 핵심 플래그

  // footer 높이 추적
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const update = () => setFooterH(el.offsetHeight);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  const calcIsAtBottom = (el: HTMLElement) => {
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    return gap <= 100;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottomNow = calcIsAtBottom(el);
    isAtBottomRef.current = atBottomNow;
    setAtBottom(atBottomNow);

    if (atBottomNow && lastUnread) {
      setLastUnread(null);
    }
  };

  // 메시지 들어올 때 처리
  useEffect(() => {
    const addedCount = messages.length - prevLenRef.current;

    if (addedCount > 0) {
      const last = messages[messages.length - 1];
      const isSystem = (last as any)?.chatType === "ENTER";
      if (!last || isSystem) {
        prevLenRef.current = messages.length;
        return;
      }

      const fromMe =
        String(last?.senderId ?? "") === String(myUser?.userId ?? "");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = listRef.current;
          if (!el) return;

          const wasAtBottom = calcIsAtBottom(el);
          isAtBottomRef.current = wasAtBottom;
          setAtBottom(wasAtBottom);

          if (fromMe || wasAtBottom) {
            scrollToBottom(fromMe ? "auto" : "smooth");
            setLastUnread(null);
          } else {
            setLastUnread(last);
          }
        });
      });
    }

    prevLenRef.current = messages.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, myUser?.userId]);

  // 첫 로드시 맨 아래로
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom("auto");
      setAtBottom(true);
      isAtBottomRef.current = true;
    }, 100);
  }, []);

  // textarea 자동 리사이즈
  const autoResize = () => {
    const el = inputRef.current;
    if (!el) return;
    const MAX_H = 160;
    el.style.height = "auto";
    const h = Math.min(el.scrollHeight, MAX_H);
    el.style.height = `${h}px`;
    el.style.overflowY = el.scrollHeight > MAX_H ? "auto" : "hidden";
    setIsMultiline(h > 48);
  };

  useEffect(() => {
    autoResize();
  }, [newMessage]);

  // ✅ 도배 감지: 메시지 실제 도착 확인
  useEffect(() => {
    // 게스트면 여기서 감지하지 않고 바로 빠짐
    if (!isLoggedIn) {
      pendingSendRef.current = null;
      lastMsgCountRef.current = messages.length;
      return;
    }

    const pending = pendingSendRef.current;
    if (!pending) {
      lastMsgCountRef.current = messages.length;
      return;
    }

    const last = messages[messages.length - 1];
    if (
      last &&
      myUser?.userId &&
      String(last.senderId) === String(myUser.userId) &&
      last.content === pending.content
    ) {
      // 서버가 받아줌
      pendingSendRef.current = null;
      lastMsgCountRef.current = messages.length;
      return;
    }

    lastMsgCountRef.current = messages.length;
  }, [messages, myUser?.userId, isLoggedIn]);

  // ✅ 배너 띄우는 공통 함수
  const triggerRateLimited = (ms = 5000) => {
    const now = Date.now();
    setRateLimitedUntil(now + ms);
  };

  const handleSendMessage = () => {
    const v = newMessage.trim();
    if (!v) return;
    if (countGraphemes(newMessage) > MAX_LEN) return;

    const now = Date.now();
    const isRateLimitedNow =
      rateLimitedUntil !== null && now < rateLimitedUntil;

    if (isRateLimitedNow) {
      triggerRateLimited();
      return;
    }

    // 로그인한 사용자만 "내 메시지 돌아왔나" 체크를 위해 pending 설정
    let sentAt = Date.now();
    if (isLoggedIn) {
      pendingSendRef.current = { content: v, at: sentAt };
    } else {
      // 게스트는 optimistic 감지 안 함
      pendingSendRef.current = null;
    }

    const maybePromise = sendMessage(v);
    setNewMessage("");

    requestAnimationFrame(() => {
      scrollToBottom("auto");
      setAtBottom(true);
      isAtBottomRef.current = true;
      const el = inputRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.overflowY = "hidden";
        el.focus({ preventScroll: true });
      }
    });

    // Promise 에러가 429면 누구든 띄움
    Promise.resolve(maybePromise).catch((err) => {
      const type =
        (err as any)?.response?.data?.type || (err as any)?.type || "";
      if (type === "CHAT_RATE_LIMITED" || (err as any)?.status === 429) {
        triggerRateLimited();
        pendingSendRef.current = null;
      }
    });

    // ✅ 이 타이머도 로그인 사용자에게만 적용
    if (isLoggedIn) {
      setTimeout(() => {
        const pendingNow = pendingSendRef.current;
        if (!pendingNow) return;
        if (pendingNow.at === sentAt) {
          triggerRateLimited();
          pendingSendRef.current = null;
        }
      }, 100);
    }
  };

  // 차단 모달 열기
  const openBlockConfirm = (user: { id: string; nickname: string }) => {
    setBlockConfirm({ isOpen: true, user });
  };

  // 차단 확정
  const confirmBlock = async () => {
    if (!blockConfirm.user) return;
    const id = blockConfirm.user.id;

    onBlockUser(id);
    try {
      const res = await blockUser(id);
      console.log(res.message);
    } catch (err) {
      console.error("차단 실패:", err);
    } finally {
      setBlockConfirm({ isOpen: false, user: null });
    }
  };

  const charCount = countGraphemes(newMessage);
  const overLimit = charCount > MAX_LEN;

  const previewContent = (m: ChatMessage | null) => {
    if (!m) return "";
    if ((m as any).isImage) return "[GIF]";
    return previewGraphemes(m.content ?? "", 10);
  };

  const isRateLimitedNow =
    rateLimitedUntil !== null && Date.now() < rateLimitedUntil;

  return (
    <>
      <ConfirmModal
        isOpen={blockConfirm.isOpen}
        onConfirm={confirmBlock}
        onCancel={() => setBlockConfirm({ isOpen: false, user: null })}
        nickname={blockConfirm.user?.nickname ?? ""}
      />

      <div className="relative flex flex-col h-full bg-gray-800 text-white">
        {/* ✅ 도배 안내 말풍선 */}
        {isRateLimitedNow && (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[300] transition-opacity"
            style={{
              bottom: (footerH || 88) + 12,
              maxWidth: "92%",
            }}
          >
            <div className="bg-red-500 text-white text-sm md:text-base px-5 py-2 rounded-2xl shadow-lg border border-red-300 flex items-center gap-2 whitespace-nowrap justify-center">
              ⚠️ 채팅 도배로 5초간 채팅이 제한됩니다.
            </div>
          </div>
        )}

        {/* 메시지 목록 */}
        <div
          ref={listRef}
          onScroll={onScroll}
          className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 min-h-0"
          style={{
            paddingBottom: 8,
            scrollPaddingBottom: (footerH || 88) + 8,
            scrollbarGutter: "stable both-edges" as any,
          }}
        >
          {messages.map((msg, index) => {
            if ((msg as any).chatType === "ENTER") {
              return (
                <div
                  key={`system-${index}`}
                  className="text-center text-xs text-gray-500 py-1"
                >
                  {msg.content}
                </div>
              );
            }

            const uniqueKey = `${msg.senderId}-${(msg as any).sentAt || index}`;
            const isMyMessage =
              String(msg.senderId ?? "") === String(myUser?.userId ?? "");

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
                  className={`group relative flex items-end gap-2 max-w-[85%] ${
                    isMyMessage ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {(msg as any).isImage ? (
                    <div className="relative">
                      <img
                        src={msg.content}
                        alt="gif"
                        className="rounded-2xl border border-black/5
                                  max-w-full sm:max-w-[240px] max-h-[240px]
                                  object-contain block"
                        style={{
                          width: "100%",
                          height: "auto",
                        }}
                        loading="lazy"
                        onLoad={() => scrollToBottom("auto")}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                      {!isMyMessage && (
                        <Popover className="absolute top-1 right-1">
                          <Popover.Button className="p-0.5 rounded-full bg-black/30 hover:bg-black/50 focus:outline-none">
                            <MoreVertical size={14} className="text-white" />
                          </Popover.Button>
                          <Transition
                            enter="transition duration-100 ease-out"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition duration-75 ease-out"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                          >
                            <Popover.Panel className="absolute z-10 top-0 left-full ml-2 w-40 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
                              <div className="flex flex-col p-1">
                                <button
                                  onClick={() =>
                                    openBlockConfirm({
                                      id: msg.senderId,
                                      nickname: msg.senderNickName,
                                    })
                                  }
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
                                >
                                  <UserX size={14} />
                                  <span className="whitespace-nowrap">
                                    차단하기
                                  </span>
                                </button>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </Popover>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`relative group px-4 py-2 rounded-lg text-sm ${
                        isMyMessage ? "bg-purple-600" : "bg-gray-700"
                      } break-all`}
                    >
                      <span className={!isMyMessage ? "pr-5" : ""}>
                        {msg.content}
                      </span>

                      {!isMyMessage && (
                        <Popover className="absolute top-1 right-1">
                          <Popover.Button className="p-0.5 rounded-full hover:bg-black/20 focus:outline-none">
                            <MoreVertical size={14} className="text-white" />
                          </Popover.Button>
                          <Transition
                            enter="transition duration-100 ease-out"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition duration-75 ease-out"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                          >
                            <Popover.Panel className="absolute z-10 top-0 left-full ml-2 w-40 bg-gray-600 border border-gray-500 rounded-lg shadow-lg">
                              <div className="flex flex-col p-1">
                                <button
                                  onClick={() =>
                                    openBlockConfirm({
                                      id: msg.senderId,
                                      nickname: msg.senderNickName,
                                    })
                                  }
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-purple-600 rounded-md"
                                >
                                  <UserX size={14} />
                                  <span className="whitespace-nowrap">
                                    차단하기
                                  </span>
                                </button>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </Popover>
                      )}
                    </div>
                  )}

                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date((msg as any).sentAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          <div
            ref={messagesEndRef}
            style={{ scrollMarginBottom: (footerH || 88) + 8 }}
          />
        </div>

        {/* 새 메시지 배지 */}
        {lastUnread && !atBottom && (
          <div
            onClick={() => {
              setLastUnread(null);
              scrollToBottom("smooth");
              setAtBottom(true);
              isAtBottomRef.current = true;
            }}
            className="absolute left-1/2 -translate-x-1/2 z-[200] cursor-pointer"
            style={{
              bottom: (footerH || 88) + 8,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-3 py-2">
              <div className="flex items-center gap-2 max-w-[280px]">
                <span className="text-gray-900 text-sm font-semibold shrink-0">
                  {previewGraphemes(lastUnread.senderNickName ?? "", 7)}
                </span>
                <span className="text-gray-800 text-sm truncate">
                  {previewContent(lastUnread)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <div
          ref={footerRef}
          className="p-3 border-t border-gray-700 bg-gray-800/80"
        >
          <div
            className={`rounded-lg border bg-gray-700 transition-colors
                        ${
                          overLimit
                            ? "border-red-500"
                            : "border-gray-600 focus-within:border-purple-500"
                        } ${isRateLimitedNow ? "opacity-70" : ""}`}
          >
            <div
              className={`flex ${
                isMultiline ? "items-end" : "items-center"
              } gap-2 px-3 py-2`}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onInput={autoResize}
                onKeyDown={(e) => {
                  // @ts-ignore
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent?.isComposing
                  ) {
                    e.preventDefault();
                    if (!overLimit) handleSendMessage();
                  }
                }}
                placeholder={
                  isRateLimitedNow
                    ? "채팅 도배로 잠시 제한되었습니다."
                    : myUser
                    ? "메시지를 입력하세요..."
                    : "게스트로 채팅하기..."
                }
                className="flex-1 bg-transparent border-0 outline-none resize-none max-h-40
                          text-base md:text-sm leading-6 placeholder:text-gray-400
                          focus:ring-0 p-0"
                disabled={isRateLimitedNow}
              />

              <button
                type="button"
                tabIndex={-1}
                onPointerDown={(e) => {
                  e.preventDefault();
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  sentByPointerRef.current = true;
                  if (!overLimit) handleSendMessage();
                }}
                onClick={(e) => {
                  if (sentByPointerRef.current) {
                    sentByPointerRef.current = false;
                    return;
                  }
                  e.preventDefault();
                  if (!overLimit) handleSendMessage();
                }}
                disabled={!newMessage.trim() || overLimit || isRateLimitedNow}
                className="h-9 w-9 rounded-full flex items-center justify-center
                          bg-gray-600 hover:bg-gray-500 transition-colors
                          disabled:bg-gray-700 disabled:cursor-not-allowed
                          shrink-0"
                aria-label="메시지 전송"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
          </div>

          <div className="mt-1 flex justify-end">
            <span
              className={`text-xs ${
                overLimit ? "text-red-400" : "text-gray-400"
              }`}
            >
              {charCount}/{MAX_LEN}
              {overLimit ? " (최대 초과)" : ""}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;

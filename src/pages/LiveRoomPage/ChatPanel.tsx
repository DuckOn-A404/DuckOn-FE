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


import { useState, useEffect, useRef } from "react";
import {
  Send,
  MoreVertical,
  UserX,
  // LockKeyhole,
  // Languages,
} from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import { useUserStore } from "../../store/useUserStore";
import type { ChatMessage } from "../../types/chat";
// import { translateMessage } from "../../api/translateService";
import { blockUser } from "../../api/userService";

// --- 부모로부터 받아야 할 Props 타입 정의 ---
type ChatPanelProps = {
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  onBlockUser: (userId: string) => void;
};

// 최근 메시지/이름 미리보기: 그래펨 기준 limit, 초과 시 …
function previewGraphemes(s: string, limit: number): string {
  if (!s) return "";
  // @ts-ignore
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    // @ts-ignore
    const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
    const parts = Array.from(seg.segment(s)).map((p: any) => p.segment);
    return parts.length > limit ? parts.slice(0, limit).join("") + "…" : s;
  }
  // 폴백: 코드포인트 기준
  return s.length > limit ? s.slice(0, limit) + "…" : s;
}

// 유니코드 안전 글자수(그래펨 단위) 계산 (입력 제한용)
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

// --- 차단 확인 모달 컴포넌트 ---
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

  // 차단 확인 모달 상태
  const [blockConfirm, setBlockConfirm] = useState<{
    isOpen: boolean;
    user: { id: string; nickname: string } | null;
  }>({ isOpen: false, user: null });

  // ✅ 렌더에 반영되는 '바닥 여부'
  const [atBottom, setAtBottom] = useState(true);

  // ✅ 입력 영역 높이 측정(겹침 방지용)
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerH, setFooterH] = useState(0);

  // ✅ 한 줄/멀티라인 판단용
  const [isMultiline, setIsMultiline] = useState(false);

  // 입력영역 높이 자동 추적
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

  useEffect(() => {
    const addedCount = messages.length - prevLenRef.current;

    if (addedCount > 0) {
      const last = messages[messages.length - 1];

      // ✅ 시스템 메시지(ENTER)만 제외
      const isSystem = (last as any)?.chatType === "ENTER";
      if (!last || isSystem) {
        prevLenRef.current = messages.length;
        return;
      }

      const fromMe =
        String(last?.senderId ?? "") === String(myUser?.userId ?? "");

      // DOM 업데이트를 확실하게 기다림
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

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom("auto");
      setAtBottom(true);
      isAtBottomRef.current = true;
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ textarea 자동 리사이즈 (최대 높이 제한) + 멀티라인 판정
  const autoResize = () => {
    const el = inputRef.current;
    if (!el) return;
    const MAX_H = 160; // px
    el.style.height = "auto";
    const h = Math.min(el.scrollHeight, MAX_H);
    el.style.height = `${h}px`;
    el.style.overflowY = el.scrollHeight > MAX_H ? "auto" : "hidden";

    // 한 줄 기준 높이(대략 48px) 이상이면 멀티라인으로 판단
    setIsMultiline(h > 48);
  };

  useEffect(() => {
    autoResize();
  }, [newMessage]);

  const handleSendMessage = () => {
    const v = newMessage.trim();
    if (!v) return;
    if (countGraphemes(newMessage) > MAX_LEN) return; // ✅ 100자 제한

    // 전송(텍스트/URL 모두 동일하게 위임) — isImage 여부는 상위 전송 로직에서 판단
    sendMessage(v);
    setNewMessage("");

    // 전송 직후 다시 포커스
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
  };

  // 차단 확인 모달 열기
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

  // ✅ 배지에 들어갈 미리보기(이미지면 [GIF]로 표시)
  const previewContent = (m: ChatMessage | null) => {
    if (!m) return "";
    if ((m as any).isImage) return "[GIF]";
    return previewGraphemes(m.content ?? "", 10);
  };

  return (
    <>
      <ConfirmModal
        isOpen={blockConfirm.isOpen}
        onConfirm={confirmBlock}
        onCancel={() => setBlockConfirm({ isOpen: false, user: null })}
        nickname={blockConfirm.user?.nickname ?? ""}
      />

      {/* ✅ 배지 위치를 위해 relative로 감싼다 */}
      <div className="relative flex flex-col h-full bg-gray-800 text-white">
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
                  {/* === 말풍선 / 이미지 분기 === */}
                  {(msg as any).isImage ? (
                    // 이미지/GIF 렌더
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
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {/* 상대 메시지 옵션(이미지에도 노출) */}
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
                    // 텍스트 말풍선 (기존 유지)
                    <div
                      className={`relative group px-4 py-2 rounded-lg text-sm ${
                        isMyMessage ? "bg-purple-600" : "bg-gray-700"
                      } break-all`}
                    >
                      <span className={!isMyMessage ? "pr-5" : ""}>
                        {msg.content}
                      </span>

                      {/* 상대 메시지 옵션 */}
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

                  {/* 타임스탬프 */}
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

          {/* 스크롤 앵커 */}
          <div
            ref={messagesEndRef}
            style={{ scrollMarginBottom: (footerH || 88) + 8 }}
          />
        </div>

        {/* ✅ '새 메시지' 배지 */}
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
            {/* 중간 점(·) 제거된 형태 유지 */}
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

        {/* 메시지 입력 영역 */}
        <div
          ref={footerRef}
          className="p-3 border-t border-gray-700 bg-gray-800/80"
        >
          {/* ← 이 div가 ‘입력창’의 테두리/배경/포커스링을 담당 */}
          <div
            className={`rounded-lg border bg-gray-700 transition-colors
                        ${overLimit ? "border-red-500" : "border-gray-600 focus-within:border-purple-500"}`}
          >
            <div className={`flex ${isMultiline ? "items-end" : "items-center"} gap-2 px-3 py-2`}>
              {/* textarea는 투명/무테로, 공간은 flex-1로 확장 */}
              <textarea
                ref={inputRef}
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onInput={autoResize}
                onKeyDown={(e) => {
                  // @ts-ignore
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
                    e.preventDefault();
                    if (!overLimit) handleSendMessage();
                  }
                }}
                placeholder={myUser ? "메시지를 입력하세요..." : "게스트로 채팅하기..."}
                className="flex-1 bg-transparent border-0 outline-none resize-none max-h-40
                          text-base md:text-sm leading-6 placeholder:text-gray-400
                          focus:ring-0 p-0"
              />

              {/* ✅ ‘입력창 내부’ 우측 끝에 붙는 버튼 */}
              <button
                type="button"
                tabIndex={-1}
                onPointerDown={(e) => { e.preventDefault(); }}
                onPointerUp={(e) => { e.preventDefault(); sentByPointerRef.current = true; if (!overLimit) handleSendMessage(); }}
                onClick={(e) => {
                  if (sentByPointerRef.current) { sentByPointerRef.current = false; return; }
                  e.preventDefault();
                  if (!overLimit) handleSendMessage();
                }}
                disabled={!newMessage.trim() || overLimit}
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

          {/* 글자수 카운터 */}
          <div className="mt-1 flex justify-end">
            <span className={`text-xs ${overLimit ? "text-red-400" : "text-gray-400"}`}>
              {charCount}/{MAX_LEN}{overLimit ? " (최대 초과)" : ""}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;

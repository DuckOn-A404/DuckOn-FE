import {useState, useEffect, useRef, useMemo} from "react";
import {Send, MoreVertical, UserX, LogOut} from "lucide-react";
import {Popover, Transition} from "@headlessui/react";
import {useUserStore} from "../../store/useUserStore";
import type {ChatMessage} from "../../types/chat";
import {blockUser} from "../../api/userService";
import GifModal from "../../components/domain/GifModal";
import NicknameWithRank from "../../components/common/NicknameWithRank";
import {translateChatMessage} from "../../api/translateService";

type ChatPanelProps = {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void> | void;
  onBlockUser: (userId: string) => void;
  isHost?: boolean;
  onEjectUser?: (user: {id: string; nickname: string}) => void;
};

// 최근 메시지/이름 미리보기
function previewGraphemes(s: string, limit: number): string {
  if (!s) return "";
  // @ts-ignore
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    // @ts-ignore
    const seg = new Intl.Segmenter("ko", {granularity: "grapheme"});
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
    const seg = new Intl.Segmenter("ko", {granularity: "grapheme"});
    return Array.from(seg.segment(s)).length;
  }
  return [...s].length;
}

const MAX_LEN = 500;
const SCROLL_CLASS = "duckon-chat-scroll";

// 도배 기준 및 차단 시간 (백엔드 REST와 맞춰서 5초에 5번)
const RATE_LIMIT_MS = 5000;     // 차단 유지 시간: 5초
const SPAM_WINDOW_MS = 5000;    // 검사 구간: 최근 5초
const SPAM_MAX_MSG = 5;         // 5초 안에 5개까지 허용 → 6번째부터 도배

// --- 공통 ConfirmModal (차단/강퇴 둘 다 여기서) ---
const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  nickname,
  variant = "block",
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  nickname: string;
  variant?: "block" | "eject";
}) => {
  if (!isOpen) return null;

  const isEject = variant === "eject";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-700 rounded-lg p-6 shadow-xl w-full max-w-sm">
        <h3 className="text-lg font-bold text-white">
          {isEject ? "사용자 강퇴" : "사용자 차단"}
        </h3>
        <p className="text-sm text-gray-300 mt-2">
          정말로{" "}
          <span className="font-semibold text-purple-400">{nickname}</span>님을
          {isEject ? " 강퇴하시겠습니까?" : " 차단하시겠습니까?"}
          <br />
          {isEject
            ? "강퇴되면 이 방에 다시 입장하지 못할 수 있습니다."
            : "차단하면 이 사용자의 메시지가 더 이상 보이지 않습니다."}
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
            {isEject ? "강퇴" : "차단"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatPanel = ({
  messages,
  sendMessage,
  onBlockUser,
  isHost = false,
  onEjectUser,
}: ChatPanelProps) => {
  const {myUser} = useUserStore();
  const blockedSet = useUserStore((s) => s.blockedSet);
  const refreshBlockedList = useUserStore((s) => s.refreshBlockedList);

  const [newMessage, setNewMessage] = useState("");
  const [guestId, setGuestId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("duckon_guest_id");
  });

  useEffect(() => {
    if (myUser?.userId && myUser.userId.startsWith("guest:")) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("duckon_guest_id", myUser.userId);
      }
      setGuestId(myUser.userId);
    }
  }, [myUser?.userId]);

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
    user: {id: string; nickname: string} | null;
  }>({isOpen: false, user: null});

  // 강퇴 확인 모달
  const [ejectConfirm, setEjectConfirm] = useState<{
    isOpen: boolean;
    user: {id: string; nickname: string} | null;
  }>({isOpen: false, user: null});

  const [atBottom, setAtBottom] = useState(true);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerH, setFooterH] = useState(0);
  const [isMultiline, setIsMultiline] = useState(false);

  // GIF 모달 상태
  const [isGifModalOpen, setIsGifModalOpen] = useState(false);

  // 게스트가 GIF 클릭 시 띄울 안내 말풍선
  const [showGifGuestModal, setShowGifGuestModal] = useState(false);

  // 도배 감지/차단 상태
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const recentSendTimesRef = useRef<number[]>([]); // 최근 전송 시각 목록
  const rateLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 5초 해제 타이머

  // 번역
  const [translatedMessages, setTranslatedMessages] = useState<Map<string, string>>(new Map());
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  // 메시지의 고유 ID 생성 함수
  const getMessageId = (msg: ChatMessage) => {
    return `${msg.senderId}-${msg.sentAt}`;
  };

  const handleTranslate = async (msg: ChatMessage) => {
    const msgId = getMessageId(msg);

    // 이미 번역 중이면 중단
    if (translatingIds.has(msgId)) return;

    // 이미 번역되어 있으면 토글 (제거)
    if (translatedMessages.has(msgId)) {
      setTranslatedMessages(prev => {
        const next = new Map(prev);
        next.delete(msgId);
        return next;
      });
      return;
    }

    // 번역 시작
    setTranslatingIds(prev => new Set(prev).add(msgId));

    try {
      const result = await translateChatMessage(
        msg.content,
        undefined,  // targetLang는 백엔드가 자동으로 사용자 기본 언어 사용
        (msg as any).senderLang  // 보낸 사람의 언어 (있으면)
      );

      setTranslatedMessages(prev =>
        new Map(prev).set(msgId, result.translatedText)
      );
    } catch (error) {
      console.error("번역 실패:", error);
      alert("번역에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setTranslatingIds(prev => {
        const next = new Set(prev);
        next.delete(msgId);
        return next;
      });
    }
  };

  const pendingSendRef = useRef<{
    content: string;
    at: number;
    msgCount: number;
    self: boolean;
  } | null>(null);
  const lastMsgCountRef = useRef<number>(messages.length);

  const isLoggedIn = !!myUser?.userId;
  const isGuest = !myUser;

  // 컴포넌트 unmount 시 타이머 정리
  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) {
        clearTimeout(rateLimitTimerRef.current);
      }
    };
  }, []);

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
    messagesEndRef.current?.scrollIntoView({behavior, block: "end"});
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

  // DEBUG: 마지막 메시지 로그
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    const rawSender = (last as any).senderId;
    const rawUserId = (last as any).userId;

    console.log("[CHAT DEBUG] last message", {
      senderId: rawSender,
      userId: rawUserId,
      content: last.content,
    });
  }, [messages]);

  // 메시지 들어올 때 처리 (unread + guest id 학습)
  useEffect(() => {
    const addedCount = messages.length - prevLenRef.current;

    if (addedCount > 0) {
      const last = messages[messages.length - 1];
      const isSystem = (last as any)?.chatType === "ENTER";
      if (!last || isSystem) {
        prevLenRef.current = messages.length;
        return;
      }

      const myIdNow = String(myUser?.userId ?? guestId ?? "");
      const lastSenderId = String(
        (last as any).senderId ?? (last as any).userId ?? ""
      );

      let fromMe = false;

      if (myIdNow && lastSenderId && myIdNow === lastSenderId) {
        fromMe = true;
      } else if (
        !myIdNow &&
        lastSenderId &&
        pendingSendRef.current &&
        pendingSendRef.current.content === last.content
      ) {
        // 아직 내 id를 모르는 guest인데,
        // 내가 방금 보낸 메시지와 내용이 같다면 이건 내 메시지라고 보고 id를 학습
        fromMe = true;
        setGuestId(lastSenderId);
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("duckon_guest_id", lastSenderId);
          }
        } catch {
          // 세션 접근 불가시 무시
        }
      }

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
  }, [messages.length, myUser?.userId, guestId, messages]);

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

  // 메시지 수신 시 pending 해제
  useEffect(() => {
    const pending = pendingSendRef.current;

    if (pending) {
      const last = messages[messages.length - 1];

      if (
        pending.self &&
        last &&
        myUser?.userId &&
        String(
          (last as any).senderId ?? (last as any).userId ?? ""
        ) === String(myUser.userId) &&
        last.content === pending.content
      ) {
        // 내가 보낸 메시지가 서버에서 돌아온 걸 확인 → pending 해제
        pendingSendRef.current = null;
      } else if (pending.self && messages.length > pending.msgCount) {
        // 로그인 유저일 때만 백업 제거
        pendingSendRef.current = null;
      }
      // 게스트(pending.self === false)는 guestId 학습용으로 유지
    }

    lastMsgCountRef.current = messages.length;
  }, [messages, myUser?.userId]);

  // 도배 배너 + 상태 해제 타이머
  const triggerRateLimited = (ms = RATE_LIMIT_MS) => {
    if (rateLimitTimerRef.current) {
      clearTimeout(rateLimitTimerRef.current);
    }

    const until = Date.now() + ms;
    setRateLimitedUntil(until);
    recentSendTimesRef.current = []; // 차단 동안 카운트 초기화

    rateLimitTimerRef.current = setTimeout(() => {
      setRateLimitedUntil((prev) => (prev === until ? null : prev));
      rateLimitTimerRef.current = null;
    }, ms);
  };

  const URL_REGEX = /^https?:\/\//i;
  const GIF_URL_REGEX = /\.gif(\?|#|$)/i;

  const handleSendMessage = () => {
    const v = newMessage.trim();
    if (!v) return;
    if (countGraphemes(newMessage) > MAX_LEN) return;

    // 익명 사용자는 URL / GIF URL 전송 금지
    if (isGuest && (URL_REGEX.test(v) || GIF_URL_REGEX.test(v))) {
      return;
    }

    // 이미 도배 차단 중이면 그냥 무시 (추가 연장 X)
    if (rateLimitedUntil !== null) {
      return;
    }

    // 스팸 감지: 최근 SPAM_WINDOW_MS 안에 SPAM_MAX_MSG개 이상이면 도배로 간주
    const now = Date.now();
    const recent = recentSendTimesRef.current.filter(
      (t) => now - t <= SPAM_WINDOW_MS
    );
    recent.push(now);
    recentSendTimesRef.current = recent;

    if (recent.length > SPAM_MAX_MSG) {
      // 6번째부터 차단
      triggerRateLimited();
      return;
    }

    const sentAt = now;

    pendingSendRef.current = {
      content: v,
      at: sentAt,
      msgCount: messages.length,
      self: isLoggedIn,
    };

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
        el.focus({preventScroll: true});
      }
    });

    // WebSocket publish는 보통 에러가 없지만, 혹시 REST 등으로 바뀌었을 때 대비
    Promise.resolve(maybePromise).catch((err) => {
      const type =
        (err as any)?.response?.data?.type || (err as any)?.type || "";
      const status =
        (err as any)?.response?.status ?? (err as any)?.status ?? null;

      if (type === "CHAT_RATE_LIMITED" || status === 429) {
        triggerRateLimited();
        pendingSendRef.current = null;
      }
    });
  };

  // ---- 차단 필터 ----
  const visibleMessages = useMemo(
    () =>
      (Array.isArray(messages) ? messages : []).filter((m) => {
        const senderId = String(
          (m as any).senderId ?? (m as any).userId ?? ""
        );
        return !blockedSet.has(senderId);
      }),
    [messages, blockedSet]
  );

  // 차단/해제 직후 UX 보강
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToBottom("auto");
      setAtBottom(true);
      isAtBottomRef.current = true;
      setLastUnread(null);
    });
  }, [blockedSet]);

  // 차단 모달 열기
  const openBlockConfirm = (user: {id: string; nickname: string}) => {
    setBlockConfirm({isOpen: true, user});
  };

  // 차단 확정
  const confirmBlock = async () => {
    if (!blockConfirm.user) return;
    const id = String(blockConfirm.user.id);

    try {
      const res = await blockUser(id);
      onBlockUser(id);
      refreshBlockedList().catch(() => { });
      console.log(res.message);
    } catch (err) {
      console.error("차단 실패:", err);
    } finally {
      setBlockConfirm({isOpen: false, user: null});
    }
  };

  // 강퇴 모달 열기
  const openEjectConfirm = (user: {id: string; nickname: string}) => {
    setEjectConfirm({isOpen: true, user});
  };

  // 강퇴 확정
  const confirmEject = () => {
    if (ejectConfirm.user && onEjectUser) {
      onEjectUser(ejectConfirm.user);
    }
    setEjectConfirm({isOpen: false, user: null});
  };

  // 게스트 GIF 안내 말풍선 3초 뒤 자동 닫힘
  useEffect(() => {
    if (!showGifGuestModal) return;
    const timer = setTimeout(() => setShowGifGuestModal(false), 3000);
    return () => clearTimeout(timer);
  }, [showGifGuestModal]);

  // GIF 선택 핸들러
  const handleSelectGif = (gifUrl: string) => {
    if (isGuest) {
      setIsGifModalOpen(false);
      setShowGifGuestModal(true);
      return;
    }
    sendMessage(gifUrl);
    setIsGifModalOpen(false);
  };

  const charCount = countGraphemes(newMessage);
  const overLimit = charCount > MAX_LEN;

  const previewContent = (m: ChatMessage | null) => {
    if (!m) return "";
    if ((m as any).isImage) return "[GIF]";
    return previewGraphemes(m.content ?? "", 10);
  };

  // 단순히 “차단 중인지 여부”
  const isRateLimitedNow = rateLimitedUntil !== null;

  const myId = String(myUser?.userId ?? guestId ?? "");

  return (
    <>
      {/* 차단 모달 */}
      <ConfirmModal
        isOpen={blockConfirm.isOpen}
        onConfirm={confirmBlock}
        onCancel={() => setBlockConfirm({isOpen: false, user: null})}
        nickname={blockConfirm.user?.nickname ?? ""}
        variant="block"
      />

      {/* 강퇴 모달 */}
      <ConfirmModal
        isOpen={ejectConfirm.isOpen}
        onConfirm={confirmEject}
        onCancel={() => setEjectConfirm({isOpen: false, user: null})}
        nickname={ejectConfirm.user?.nickname ?? ""}
        variant="eject"
      />

      {/* GIF 모달 */}
      <GifModal
        isOpen={isGifModalOpen}
        onClose={() => setIsGifModalOpen(false)}
        onSelectGif={handleSelectGif}
      />

      <div className="relative flex flex-col h-full bg-gray-800 text-white">
        {/* 도배 안내 말풍선 */}
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

        {/* 게스트 GIF 사용 제한 안내 말풍선 */}
        {showGifGuestModal && (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[300] transition-opacity"
            style={{
              bottom: (footerH || 88) + 12,
              maxWidth: "92%",
            }}
          >
            <div
              className=" 
              flex items-center gap-2 justify-center
              px-5 py-2
              rounded-2xl
              bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500
              text-white text-sm md:text-base font-semibold tracking-tight
              shadow-lg
              border border-purple-300/40
              whitespace-nowrap
            "
            >
              로그인한 유저만 밈을 사용할 수 있습니다!
            </div>
          </div>
        )}

        {/* 메시지 목록 */}
        <div
          ref={listRef}
          onScroll={onScroll}
          className={`flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 min-h-0 ${SCROLL_CLASS}`}
          style={{
            paddingBottom: 8,
            scrollPaddingBottom: (footerH || 88) + 8,
            scrollbarGutter: "stable both-edges" as any,
          }}
        >
          {visibleMessages.map((msg, index) => {
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

            const senderId = String(
              (msg as any).senderId ?? (msg as any).userId ?? ""
            );
            const uniqueKey = `${senderId}-${(msg as any).sentAt || index}`;
            const isMyMessage =
              senderId !== "" && myId !== "" && senderId === myId;

            const rawRankLevel =
              (msg as any).rankLevel || (msg as any).userRank?.rankLevel;
            const hasRank = !!rawRankLevel;

            // 번역 관련 데이터
            const msgId = getMessageId(msg);
            const translatedText = translatedMessages.get(msgId);
            const isTranslating = translatingIds.has(msgId);

            return (
              <div
                key={uniqueKey}
                className={`group flex flex-col ${isMyMessage ? "items-end" : "items-start"
                  }`}
              >
                {/* 닉네임 + 랭크 */}
                <span className="text-xs text-gray-200 mb-1">
                  {hasRank ? (
                    <NicknameWithRank
                      nickname={msg.senderNickName}
                      rankLevel={rawRankLevel}
                      badgeSize={18}
                    />
                  ) : (
                    msg.senderNickName
                  )}
                </span>

                <div
                  className={`relative flex items-end gap-1 max-w-[90%] ${isMyMessage ? "flex-row-reverse" : "flex-row"
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
                      {!isMyMessage && !!myUser && (
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
                                {isHost && (
                                  <button
                                    onClick={() =>
                                      openEjectConfirm({
                                        id: senderId,
                                        nickname: msg.senderNickName,
                                      })
                                    }
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-red-600 rounded-md"
                                  >
                                    <LogOut size={14} />
                                    <span className="whitespace-nowrap">
                                      강퇴하기
                                    </span>
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    openBlockConfirm({
                                      id: senderId,
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
                      className={`relative px-4 py-2 rounded-lg text-sm ${isMyMessage ? "bg-purple-600" : "bg-gray-700"
                        } break-all`}
                    >
                      <span className={!isMyMessage ? "pr-1" : ""}>
                        {msg.content}
                      </span>

                      {!isMyMessage && !!myUser && (
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
                                {isHost && (
                                  <button
                                    onClick={() =>
                                      openEjectConfirm({
                                        id: senderId,
                                        nickname: msg.senderNickName,
                                      })
                                    }
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-red-600 rounded-md"
                                  >
                                    <LogOut size={14} />
                                    <span className="whitespace-nowrap">
                                      강퇴하기
                                    </span>
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    openBlockConfirm({
                                      id: senderId,
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

                  {/* 번역 버튼 - 채팅 버블과 시간 사이에 위치 */}
                  {!isMyMessage && !(msg as any).isImage && (
                    <button
                      onClick={() => handleTranslate(msg)}
                      className={`
                        px-1.5 py-0.5 text-xs rounded flex items-center gap-0.5
                        ${translatedText
                          ? "bg-purple-700 text-white opacity-100"
                          : "bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100"
                        }
                        hover:bg-purple-600 transition-all duration-200
                      `}
                      disabled={isTranslating}
                    >
                      {isTranslating ? (
                        <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                      ) : translatedText ? (
                        <span>✓</span>
                      ) : (
                        <span>🌐</span>
                      )}
                    </button>
                  )}

                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date((msg as any).sentAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* 번역 결과 */}
                {translatedText && (
                  <div
                    className={`
                      mt-2 px-4 py-2 rounded-lg border-l-2 max-w-[90%]
                      ${isMyMessage
                        ? "bg-purple-500/30 border-purple-400"
                        : "bg-gray-600/50 border-purple-400"
                      }
                      text-sm text-gray-100
                    `}
                  >
                    <div className="text-xs text-purple-300 mb-1">번역:</div>
                    <div className="break-all">{translatedText}</div>
                  </div>
                )}
              </div>
            );
          })}

          <div
            ref={messagesEndRef}
            style={{scrollMarginBottom: (footerH || 88) + 8}}
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
                        ${overLimit
                ? "border-red-500"
                : "border-gray-600 focus-within:border-purple-500"
              } ${isRateLimitedNow ? "opacity-70" : ""}`}
          >
            <div
              className={`flex ${isMultiline ? "items-end" : "items-center"
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

              {/* GIF 버튼 (게스트도 모달은 열 수 있음) */}
              <button
                type="button"
                onClick={() => setIsGifModalOpen(!isGifModalOpen)}
                disabled={isRateLimitedNow}
                className="w-9 h-9 rounded-lg flex items-center justify-center
                          bg-gray-600 hover:bg-gray-500 transition-colors
                          disabled:bg-gray-700 disabled:cursor-not-allowed
                          shrink-0 text-xs font-medium text-white leading-tight"
                aria-label="GIF 선택"
              >
                <div className="text-center">
                  <div>GIF</div>
                </div>
              </button>

              {/* 전송 버튼 */}
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
              className={`text-xs ${overLimit ? "text-red-400" : "text-gray-400"
                }`}
            >
              {charCount}/{MAX_LEN}
              {overLimit ? " (최대 초과)" : ""}
            </span>
          </div>
        </div>

        <style>{`
          .duckon-chat-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(148,163,184,.3) #1e293b;
          }
          .duckon-chat-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .duckon-chat-scroll::-webkit-scrollbar-track {
            background: #1e293b;
            border-radius: 9999px;
          }
          .duckon-chat-scroll::-webkit-scrollbar-thumb {
            background: rgba(148,163,184,.35);
            border-radius: 9999px;
            transition: background 0.2s ease;
          }
          .duckon-chat-scroll:hover::-webkit-scrollbar-thumb {
            background: rgba(203,213,225,.55);
          }
        `}</style>
      </div>
    </>
  );
};

export default ChatPanel;

import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {useEffect, useState, useRef, useCallback} from "react";
import {
  enterRoom,
  exitRoom,
  deleteRoom,
  ejectUserFromRoom,
  updateRoomTitle,
} from "../../api/roomService";
import {useUserStore} from "../../store/useUserStore";
import {Client, type IMessage, type StompSubscription} from "@stomp/stompjs";
import {createStompClient} from "../../socket";

import EntryQuizModal from "./EntryQuizModal";
import LiveHeader from "./LiveHeader";
import VideoPlayer from "./VideoPlayer";
import RightSidebar from "./RightSidebar";
import {useChatSubscription} from "../../hooks/useChatSubscription";
import RoomDeletedModal from "../../components/common/modal/RoomDeletedModal";
import ConfirmModal from "../../components/common/modal/ConfirmModal";
import {onTokenRefreshed, onRefreshState} from "../../api/axiosInstance";
import {fireAndForget} from "../../utils/fireAndForget";
import {blockUser, getBlockedUsers} from "../../api/userService";
import type {LiveRoomSyncDTO} from "../../types/room";
/** 추가: GIF/이미지 URL 전송 헬퍼 */
import {sendGifMessage} from "../../socket";
/** 기존: 강퇴 알림 모달 (실시간 킥 수신용) */
import EjectAlarmModal from "../../components/common/modal/EjectAlarmModal";
/** 추가: 재입장 시 400 에러용 킥 안내 모달 */
import KickedInfoModal from "../../components/common/modal/KickedInfoModal";
import {Capacitor} from "@capacitor/core";

const DEFAULT_QUIZ_PROMPT = "비밀번호(정답)를 입력하세요.";

// 백엔드가 이제 playlist에 전체 URL도 보낼 수 있으니까 여기서 전부 videoId로 바꿔버린다.
const extractVideoId = (value: string): string => {
  if (!value) return "";
  const trimmed = value.trim();

  // https://youtube.com/watch?v=AbCdEf12345
  const fullMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
  );
  if (fullMatch?.[1]) return fullMatch[1];

  // 그냥 11글자 id만 온 경우
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  return trimmed; // 혹시 모를 예외는 그냥 원본 리턴
};

const normalizePlaylist = (list?: string[] | null): string[] => {
  if (!Array.isArray(list)) return [];
  return list.map((item) => extractVideoId(item || ""));
};

// BE 응답이 { userId, nickname, room: {...} } 도 될 수 있고,
// 예전처럼 {roomId, ...} 바로일 수도 있으니 여기서 통일해서 room 객체만 꺼내서 정규화
const normalizeRoomResponse = (raw: any) => {
  const room = raw?.room ?? raw ?? null;
  if (!room) return null;
  return {
    ...room,
    playlist: normalizePlaylist(room.playlist),
  };
};

/** 오래된 이벤트 무시용 타임스탬프 가드 */
const isNewerOrEqual = (evtLU?: number, prevLU?: number) => {
  if (typeof evtLU !== "number") return true;
  if (typeof prevLU !== "number") return true;
  return evtLU >= prevLU;
};

type LiveRoomLocationState = {
  artistId?: number;
  isHost?: boolean;
  entryAnswer?: string; // 잠금 방 대비
};

const LiveRoomPage = () => {
  const {roomId} = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation() as {state?: LiveRoomLocationState};
  const {myUser} = useUserStore();
  const myUserId = myUser?.userId;
  const navigate = useNavigate();

  const navState = location.state as LiveRoomLocationState | undefined;
  const isHostFromNav = navState?.isHost === true;
  const entryAnswerFromNav = navState?.entryAnswer ?? "";

  const [room, setRoom] = useState<any>(null);
  const [hostNickname, setHostNickname] = useState<string | null>(null);
  /** 아티스트 영어 경로 보관 */
  const [artistSlug, setArtistSlug] = useState<string | null>(null);

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "playlist">("chat");

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [entryQuestion, setEntryQuestion] = useState<string | null>(null);
  const {messages, sendMessage} = useChatSubscription(stompClient, roomId);

  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [isPlaylistUpdating, setIsPlaylistUpdating] = useState(false);
  const [roomDeletedOpen, setRoomDeletedOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  /** 강퇴당했는지 여부 (실시간 킥 수신) */
  const [isKicked, setIsKicked] = useState(false);
  /** 재입장 400 응답용 모달 오픈 상태 */
  const [kickedOpen, setKickedOpen] = useState(false);

  const presenceRef = useRef<Client | null>(null);
  const syncRef = useRef<Client | null>(null);
  const lastTokenRef = useRef<string | null>(
    localStorage.getItem("accessToken") || null
  );
  const leavingRef = useRef(false);
  const isHostRef = useRef(false);
  const joinedRef = useRef(false);

  // 리프레시/WS 핸드오버 상태
  const wsHandoverRef = useRef(false);
  const isRefreshingRef = useRef(false);

  const initialSyncSentRef = useRef(false);

  const isHostView = !!(room && myUser && room.hostId === myUser.userId);

  // 앱 여부 / 가로 모드 여부
  const isNativeApp = Capacitor.isNativePlatform() || window.innerWidth <= 768;
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      try {
        setIsLandscape(window.innerWidth > window.innerHeight);
      } catch {
        setIsLandscape(false);
      }
    };
    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation as any);
    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation as any);
    };
  }, []);

  // 1) 차단 목록 state
  const blockedSet = useUserStore((s) => s.blockedSet);
  const setBlockedList = useUserStore((s) => s.setBlockedList);
  const blockLocal = useUserStore((s) => s.blockLocal);

  // 2) 서버 차단목록 로드해서 병합 (입장/로그인 시)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!myUserId || blockedSet.size > 0) return;

      try {
        const list = await getBlockedUsers();
        if (!mounted) return;
        setBlockedList(list.map((u) => u.userId));
      } catch (e) {
        console.error("차단 목록 불러오기 실패:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [myUserId, blockedSet.size, setBlockedList]);

  // const handleBlockUser = (userId: string) => {
  //   blockLocal(userId);
  // };

  const handleBlockUser = async (userId: string) => {
    try {
      await blockUser(userId);
      blockLocal(userId);
      const list = await getBlockedUsers();
      setBlockedList(list.map((u) => u.userId));
    } catch (err) {
      console.error("차단 요청 실패:", err);
    }
  };

  const visibleMessages = messages.filter(
    (m) =>
      !blockedSet.has(
        String((m as any).senderId ?? (m as any).userId ?? "")
      )
  );

  const parseId = (raw: string | null) => {
    if (!raw) return undefined;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const artistIdFromQuery = parseId(searchParams.get("artistId"));
  const artistIdFromRoom =
    room?.artistId && room.artistId > 0 ? room.artistId : undefined;
  const artistIdFromState =
    location.state?.artistId && location.state.artistId > 0
      ? location.state.artistId
      : undefined;

  const resolvedArtistId =
    artistIdFromQuery ?? artistIdFromRoom ?? artistIdFromState;

  // 참가자 퇴장
  const performExit = useCallback(async () => {
    if (!roomId || !resolvedArtistId || leavingRef.current) return;
    leavingRef.current = true;
    try {
      await exitRoom(Number(roomId), resolvedArtistId);
    } finally {
      try {
        await stompClient?.deactivate();
      } catch { }
    }
  }, [roomId, resolvedArtistId, stompClient]);

  // 방장 삭제
  const performDelete = useCallback(async () => {
    if (!roomId || !resolvedArtistId || leavingRef.current) return;
    leavingRef.current = true;
    try {
      await deleteRoom(Number(roomId), resolvedArtistId);
    } finally {
      try {
        await stompClient?.deactivate();
      } catch { }
    }
  }, [roomId, resolvedArtistId, stompClient]);

  const handleExit = async () => {
    setParticipantCount((prev) =>
      typeof prev === "number" ? Math.max(0, prev - 1) : prev
    );

    if (roomId && resolvedArtistId) {
      try {
        await performExit();
      } catch {
        setParticipantCount((prev) =>
          typeof prev === "number" ? prev + 1 : prev
        );
      }
    }

    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomId || !resolvedArtistId) {
      setIsDeleteOpen(false);
      return;
    }
    try {
      await performDelete();
    } finally {
      setIsDeleteOpen(false);
      navigate(-1);
    }
  };

  // 정답 제출
  const handleSubmitAnswer = async (answer: string) => {
    try {
      const data = await enterRoom(roomId!, answer);
      const normalized = normalizeRoomResponse(data);
      if (!normalized) return;

      setRoom(normalized);
      if (normalized.hostNickname) setHostNickname(normalized.hostNickname);
      if ((data.room ?? data).artistNameEn) {
        setArtistSlug((data.room ?? data).artistNameEn);
      }
      setIsQuizModalOpen(false);
      joinedRef.current = true;
    } catch (error: any) {
      const status = error.response?.status;

      /** 재입장 시 백엔드 400(KICKED) 응답 처리 */
      if (status === 400) {
        setKickedOpen(true);
        return;
      }

      if (status === 401 || status === 403) {
        const data = error.response?.data || {};
        const msg = (data?.message ?? "").toString();
        if (msg.includes("정답")) throw new Error("wrong_answer");

        const raw =
          (data.entryQuestion ?? data.question ?? data.quizQuestion ?? "")
            ?.toString()
            ?.trim() || "";
        setEntryQuestion(raw || DEFAULT_QUIZ_PROMPT);
        setIsQuizModalOpen(true);
        return;
      }
      throw error;
    }
  };

  // 제목 저장
  const handleSaveTitle = async (nextTitle: string) => {
    if (!roomId || !room || !isHostView) return;
    const prev = room.title;
    const now = Date.now();

    setRoom({...room, title: nextTitle, lastUpdated: now});

    try {
      await updateRoomTitle(roomId, nextTitle);
    } catch (err) {
      setRoom((r: any) => (r ? {...r, title: prev} : r));
    }
  };

  const isHost = room?.hostId === myUserId;
  useEffect(() => {
    isHostRef.current = room?.hostId === myUserId;
  }, [room?.hostId, myUserId]);

  // 강퇴 실행 함수
  const handleEjectUser = async (target: {id: string; nickname: string}) => {
    if (!roomId || !resolvedArtistId) return;
    if (!isHostView) return;
    try {
      await ejectUserFromRoom(roomId, resolvedArtistId, target.id);
    } catch (err) {
      console.error("강퇴 실패:", err);
    }
  };

  // 방장이 playlist 영상 추가
  const handleAddToPlaylist = (newVideoId: string) => {
    if (!stompClient?.connected || !myUser || !room) return;
    if (!isHost) return;

    setIsPlaylistUpdating(true);

    const normalizedNew = extractVideoId(newVideoId);
    const updatedPlaylist = [...(room.playlist || []), normalizedNew];

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      playlist: updatedPlaylist,
      currentVideoIndex: room.currentVideoIndex ?? 0,
      currentTime: 0,
      playing: false,
      lastUpdated: Date.now(),
    };

    setRoom((prev: any) => ({
      ...prev,
      playlist: updatedPlaylist,
      currentTime: 0,
      playing: false,
      lastUpdated: payload.lastUpdated,
    }));

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });

    setTimeout(() => setIsPlaylistUpdating(false), 3000);
  };

  const handleJumpToIndex = (index: number) => {
    if (!isHost || !stompClient?.connected || !room || !myUser) return;

    const size = room.playlist?.length ?? 0;
    if (index < 0 || index >= size) return;

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      playlist: room.playlist,
      currentVideoIndex: index,
      currentTime: 0,
      playing: true,
      lastUpdated: Date.now(),
    };

    setRoom((prev: any) => (prev ? {...prev, ...payload} : prev));

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });
  };

  const handleReorderPlaylist = (from: number, to: number) => {
    if (!isHost || !stompClient?.connected || !room || !myUser) return;

    const cur = Array.isArray(room.playlist) ? [...room.playlist] : [];
    const n = cur.length;
    if (n <= 1) return;
    if (from < 0 || from >= n || to < 0 || to >= n || from === to) return;

    const [m] = cur.splice(from, 1);
    cur.splice(to, 0, m);

    let nextIndex = room.currentVideoIndex ?? 0;
    if (from === nextIndex) nextIndex = to;
    else if (from < nextIndex && to >= nextIndex) nextIndex -= 1;
    else if (from > nextIndex && to <= nextIndex) nextIndex += 1;

    nextIndex = Math.max(0, Math.min(cur.length - 1, nextIndex));

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      playlist: cur,
      currentVideoIndex: nextIndex,
      currentTime: 0,
      playing: !!room.playing,
      lastUpdated: Date.now(),
    };

    setIsPlaylistUpdating(true);
    setRoom((prev: any) =>
      prev
        ? {
          ...prev,
          playlist: cur,
          currentVideoIndex: nextIndex,
          currentTime: 0,
          lastUpdated: payload.lastUpdated,
        }
        : prev
    );

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });

    setTimeout(() => setIsPlaylistUpdating(false), 1200);
  };

  const handleDeletePlaylistItem = (index: number) => {
    if (!isHost || !stompClient?.connected || !room || !myUser) return;

    const cur = Array.isArray(room.playlist) ? [...room.playlist] : [];
    if (cur.length <= 1) {
      return;
    }
    if (index < 0 || index >= cur.length) return;

    cur.splice(index, 1);

    let nextIndex = room.currentVideoIndex ?? 0;
    if (index < nextIndex) nextIndex -= 1;
    else if (index === nextIndex) {
      nextIndex = Math.min(nextIndex, cur.length - 1);
    }
    nextIndex = Math.max(0, Math.min(cur.length - 1, nextIndex));

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      playlist: cur,
      currentVideoIndex: nextIndex,
      currentTime: 0,
      playing: true,
      lastUpdated: Date.now(),
    };

    setIsPlaylistUpdating(true);
    setRoom((prev: any) =>
      prev
        ? {
          ...prev,
          playlist: cur,
          currentVideoIndex: nextIndex,
          currentTime: 0,
          playing: true,
          lastUpdated: payload.lastUpdated,
        }
        : prev
    );

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });

    setTimeout(() => setIsPlaylistUpdating(false), 1200);
  };

  // 영상 끝
  const handleVideoEnd = () => {
    if (!isHost || !room || !room.playlist || !myUser) return;

    const {currentVideoIndex, playlist} = room;
    if (currentVideoIndex >= playlist.length - 1) return;

    const nextVideoIndex = currentVideoIndex + 1;

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      playlist: room.playlist,
      currentVideoIndex: nextVideoIndex,
      currentTime: 0,
      playing: true,
      lastUpdated: Date.now(),
    };

    stompClient?.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });

    setRoom((prev: any) => ({
      ...prev,
      ...payload,
    }));
  };

  // 참가자 수 구독
  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("accessToken") || "";
    const presenceClient = createStompClient(token);
    presenceRef.current = presenceClient;

    presenceClient.onConnect = () => {
      presenceClient.subscribe(
        `/topic/room/${roomId}/presence`,
        (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            setParticipantCount(data.participantCount);
          } catch (e) {
            console.error("참가자 수 메시지 파싱 실패:", e);
          }
        }
      );
    };

    presenceClient.activate();
    return () => {
      try {
        presenceClient.deactivate();
      } catch { }
      presenceRef.current = null;
    };
  }, [roomId]);

  // 영상/채팅 동기화 + 강퇴 구독
  useEffect(() => {
    if (isQuizModalOpen || !roomId) return;

    const token = localStorage.getItem("accessToken") || "";
    const syncClient = createStompClient(token);
    let sub: StompSubscription | null = null;

    syncClient.onConnect = () => {
      setStompClient(syncClient);
      syncRef.current = syncClient;

      sub = syncClient.subscribe(
        `/topic/room/${roomId}`,
        async (message: IMessage) => {
          try {
            const evt = JSON.parse(message.body) as LiveRoomSyncDTO;
            const t = evt?.eventType;

            if (typeof (evt as any)?.participantCount === "number") {
              setParticipantCount((evt as any).participantCount);
            }

            switch (t) {
              case "ROOM_DELETED":
                setRoomDeletedOpen(true);
                return;

              case "ROOM_UPDATE":
                setRoom((prev: any) => {
                  if (!prev) return prev;
                  if (!isNewerOrEqual(evt.lastUpdated, prev.lastUpdated))
                    return prev;
                  return {
                    ...prev,
                    title: evt.title ?? prev.title,
                    hostNickname: evt.hostNickname ?? prev.hostNickname,
                    lastUpdated: evt.lastUpdated ?? prev.lastUpdated,
                  };
                });
                return;

              case "SYNC_STATE":
                setRoom((prev: any) => {
                  if (!prev) return prev;
                  if (!isNewerOrEqual(evt.lastUpdated, prev.lastUpdated))
                    return prev;
                  return {
                    ...prev,
                    roomId: evt.roomId ?? prev.roomId,
                    hostId: evt.hostId ?? prev.hostId,
                    // 여기서도 playlist 정규화
                    playlist: normalizePlaylist(evt.playlist ?? prev.playlist),
                    currentVideoIndex:
                      typeof evt.currentVideoIndex === "number"
                        ? evt.currentVideoIndex
                        : prev.currentVideoIndex,
                    currentTime:
                      typeof evt.currentTime === "number"
                        ? evt.currentTime
                        : prev.currentTime,
                    playing:
                      typeof evt.playing === "boolean"
                        ? evt.playing
                        : prev.playing,
                    lastUpdated: evt.lastUpdated ?? prev.lastUpdated,
                  };
                });
                return;

              default:
                return;
            }
          } catch (error) {
            console.error("방 상태 업데이트 메시지 파싱 실패:", error);
          }
        }
      );

      // 2) 강퇴 알림 구독
      syncClient.subscribe("/user/queue/kick", (message: IMessage) => {
        const kickedRoomId = message.body?.toString()?.trim();
        console.log("[KICK] recv:", kickedRoomId);
        if (!kickedRoomId) return;
        if (String(kickedRoomId) === String(roomId)) {
          setIsKicked(true);
        }
      });
    };

    syncClient.activate();

    return () => {
      try {
        sub?.unsubscribe();
      } catch { }
      try {
        syncClient.deactivate();
      } catch { }
      syncRef.current = null;
    };
  }, [myUserId, isQuizModalOpen, roomId, navigate]);

  // 리프레시 상태 구독
  useEffect(() => {
    const off = onRefreshState((st) => {
      isRefreshingRef.current = st === "start";
    });
    return () => {
      off();
    };
  }, []);

  // 무중단 재연결 유틸
  const seamlessReconnect = useCallback(
    async (
      oldClient: Client | null,
      token: string,
      topic: string,
      onMsg: (m: IMessage) => void
    ) => {
      return new Promise<Client>((resolve) => {
        const next = createStompClient(token);
        wsHandoverRef.current = true;

        next.onConnect = () => {
          next.subscribe(topic, onMsg);
          next.subscribe("/user/queue/kick", (message: IMessage) => {
            const kickedRoomId = message.body?.toString()?.trim();
            if (kickedRoomId && String(kickedRoomId) === String(roomId)) {
              setIsKicked(true);
            }
          });

          (async () => {
            try {
              await oldClient?.deactivate();
            } catch { }
            wsHandoverRef.current = false;
          })();
          resolve(next);
        };
        next.activate();
      });
    },
    [roomId]
  );

  // 액세스 토큰 갱신 → STOMP 무중단 재연결
  useEffect(() => {
    const unsubscribe = onTokenRefreshed(async (newToken) => {
      const prevToken = lastTokenRef.current;
      if (prevToken === newToken) return;
      lastTokenRef.current = newToken;

      // ---- Presence ----
      if (roomId) {
        const topic = `/topic/room/${roomId}/presence`;
        const onPresence = (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            if (typeof data?.participantCount === "number") {
              setParticipantCount(data.participantCount);
            }
          } catch { }
        };

        if (!newToken) {
          try {
            await presenceRef.current?.deactivate();
          } catch { }
          const p = createStompClient("");
          presenceRef.current = p;
          p.onConnect = () => {
            p.subscribe(topic, onPresence);
          };
          p.activate();
        } else {
          presenceRef.current = await seamlessReconnect(
            presenceRef.current,
            newToken,
            topic,
            onPresence
          );
        }
      }

      // ---- Sync ----
      if (!roomId || isQuizModalOpen) return;

      const topic = `/topic/room/${roomId}`;
      const onSync = (message: IMessage) => {
        try {
          const evt = JSON.parse(message.body) as LiveRoomSyncDTO;
          const t = evt?.eventType;

          if (typeof (evt as any)?.participantCount === "number") {
            setParticipantCount((evt as any).participantCount);
          }

          switch (t) {
            case "ROOM_DELETED":
              if (isRefreshingRef.current || wsHandoverRef.current) return;
              setRoomDeletedOpen(true);
              return;

            case "ROOM_UPDATE":
              setRoom((prev: any) => {
                if (!prev) return prev;
                if (!isNewerOrEqual(evt.lastUpdated, prev.lastUpdated))
                  return prev;
                return {
                  ...prev,
                  title: evt.title ?? prev.title,
                  hostNickname: evt.hostNickname ?? prev.hostNickname,
                  lastUpdated: evt.lastUpdated ?? prev.lastUpdated,
                };
              });
              return;

            case "SYNC_STATE":
              setRoom((prev: any) => {
                if (!prev) return prev;
                if (!isNewerOrEqual(evt.lastUpdated, prev.lastUpdated))
                  return prev;
                return {
                  ...prev,
                  title: evt.title ?? prev.title,
                  hostNickname: evt.hostNickname ?? prev.hostNickname,
                  roomId: evt.roomId ?? prev.roomId,
                  hostId: evt.hostId ?? prev.hostId,
                  playlist: normalizePlaylist(evt.playlist ?? prev.playlist),
                  currentVideoIndex:
                    typeof evt.currentVideoIndex === "number"
                      ? evt.currentVideoIndex
                      : prev.currentVideoIndex,
                  currentTime:
                    typeof evt.currentTime === "number"
                      ? evt.currentTime
                      : prev.currentTime,
                  playing:
                    typeof evt.playing === "boolean"
                      ? evt.playing
                      : prev.playing,
                  lastUpdated: evt.lastUpdated ?? prev.lastUpdated,
                };
              });
              return;

            default:
              return;
          }
        } catch { }
      };

      if (!newToken) {
        try {
          await syncRef.current?.deactivate();
        } catch { }
        const s = createStompClient("");
        syncRef.current = s;
        setStompClient(s);
        s.onConnect = () => {
          s.subscribe(topic, onSync);
          s.subscribe("/user/queue/kick", (message: IMessage) => {
            const kickedRoomId = message.body?.toString()?.trim();
            if (kickedRoomId && String(kickedRoomId) === String(roomId)) {
              setIsKicked(true);
            }
          });
        };
        s.activate();
      } else {
        const newSync = await seamlessReconnect(
          syncRef.current,
          newToken,
          topic,
          onSync
        );
        syncRef.current = newSync;
        setStompClient(newSync);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, isQuizModalOpen, seamlessReconnect]);

  // 최초 입장 시도
  useEffect(() => {
    let isMounted = true;
    const loadRoom = async () => {
      try {
        if (!roomId) return;

        if (isHostFromNav) {
          const data = await enterRoom(roomId, entryAnswerFromNav);
          if (!isMounted) return;
          const normalized = normalizeRoomResponse(data);
          if (!normalized) return;

          setRoom(normalized);
          if (normalized.hostNickname) setHostNickname(normalized.hostNickname);
          if ((data.room ?? data).artistNameEn) {
            setArtistSlug((data.room ?? data).artistNameEn);
          }
          joinedRef.current = true;
          setIsQuizModalOpen(false);
          return;
        }

        const data = await enterRoom(roomId, "");
        if (!isMounted) return;
        const normalized = normalizeRoomResponse(data);
        if (!normalized) return;

        setRoom(normalized);
        if (normalized && normalized.hostNickname)
          setHostNickname(normalized.hostNickname);
        if ((data.room ?? data).artistNameEn) {
          setArtistSlug((data.room ?? data).artistNameEn);
        }
        joinedRef.current = true;
      } catch (err: any) {
        const status = err?.response?.status;

        /** 재입장 시 백엔드 400(KICKED) 응답 처리 */
        if (status === 400) {
          setKickedOpen(true);
          return;
        }

        if (status === 401 || status === 403) {
          const data = err?.response?.data || {};
          const raw =
            (data.entryQuestion ?? data.question ?? data.quizQuestion ?? "")
              ?.toString()
              ?.trim() || "";
          setEntryQuestion(raw || DEFAULT_QUIZ_PROMPT);
          setIsQuizModalOpen(true);
          return;
        }
        console.error("방 정보 불러오기 실패:", err);
      }
    };
    loadRoom();
    return () => {
      isMounted = false;
    };
  }, [roomId, myUserId, isHostFromNav, entryAnswerFromNav]);

  // 액세스 토큰 갱신 → STOMP 재연결 (간단 버전)
  useEffect(() => {
    const unsubscribe = onTokenRefreshed(async (newToken) => {
      if (lastTokenRef.current === newToken) return;
      lastTokenRef.current = newToken;

      if (!newToken) {
        try {
          await presenceRef.current?.deactivate();
        } catch { }
        try {
          await syncRef.current?.deactivate();
        } catch { }
        presenceRef.current = null;
        syncRef.current = null;
        setStompClient(null);
        return;
      }

      if (roomId) {
        try {
          await presenceRef.current?.deactivate();
        } catch { }
        const p = createStompClient(newToken);
        presenceRef.current = p;
        p.onConnect = () => {
          p.subscribe(`/topic/room/${roomId}/presence`, (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              if (typeof data?.participantCount === "number") {
                setParticipantCount(data.participantCount);
              }
            } catch (e) {
              console.error("참가자 수 메시지 파싱 실패:", e);
            }
          });
        };
        p.activate();
      }

      if (myUser && !isQuizModalOpen && roomId) {
        try {
          await syncRef.current?.deactivate();
        } catch { }
        const s = createStompClient(newToken);
        syncRef.current = s;
        setStompClient(s);

        s.onConnect = () => {
          s.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
            try {
              const evt = JSON.parse(message.body) as LiveRoomSyncDTO;
              const t = evt?.eventType;

              if (typeof (evt as any)?.participantCount === "number") {
                setParticipantCount((evt as any).participantCount);
              }

              switch (t) {
                case "ROOM_DELETED":
                  setRoomDeletedOpen(true);
                  return;
                case "ROOM_UPDATE":
                  setRoom((prev: any) =>
                    prev
                      ? {
                        ...prev,
                        title: evt.title ?? prev.title,
                        hostNickname: evt.hostNickname ?? prev.hostNickname,
                      }
                      : prev
                  );
                  return;
                case "SYNC_STATE":
                  setRoom((prev: any) =>
                    prev
                      ? {
                        ...prev,
                        title: evt.title ?? prev.title,
                        hostNickname: evt.hostNickname ?? prev.hostNickname,
                        roomId: evt.roomId ?? prev.roomId,
                        hostId: evt.hostId ?? prev.hostId,
                        playlist: normalizePlaylist(
                          evt.playlist ?? prev.playlist
                        ),
                        currentVideoIndex:
                          typeof evt.currentVideoIndex === "number"
                            ? evt.currentVideoIndex
                            : prev.currentVideoIndex,
                        currentTime:
                          typeof evt.currentTime === "number"
                            ? evt.currentTime
                            : prev.currentTime,
                        playing:
                          typeof evt.playing === "boolean"
                            ? evt.playing
                            : prev.playing,
                        lastUpdated: evt.lastUpdated ?? prev.lastUpdated,
                      }
                      : prev
                  );
                  return;
                default:
                  return;
              }
            } catch (error) {
              console.error("방 상태 업데이트 메시지 파싱 실패:", error);
            }
          });

          s.subscribe("/user/queue/kick", (message: IMessage) => {
            const kickedRoomId = message.body?.toString()?.trim();
            if (kickedRoomId && String(kickedRoomId) === String(roomId)) {
              setIsKicked(true);
            }
          });
        };

        s.activate();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, myUser, isQuizModalOpen]);

  // 방장 최초 1회 SYNC 강제 송출
  useEffect(() => {
    if (!stompClient?.connected) return;
    if (!room || !myUser) return;
    if (!isHostView) return;
    if (initialSyncSentRef.current) return;

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      playlist: room.playlist || [],
      currentVideoIndex: room.currentVideoIndex ?? 0,
      currentTime: 0,
      playing: true,
      lastUpdated: Date.now(),
    };
    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });
    initialSyncSentRef.current = true;
  }, [stompClient, room, myUser, isHostView]);

  // 이탈/언마운트 정리
  useEffect(() => {
    const onPageHide = () => {
      if (!roomId || !resolvedArtistId) return;
      if (!joinedRef.current) return;

      if (isRefreshingRef.current || wsHandoverRef.current) return;

      if (leavingRef.current) return;
      leavingRef.current = true;

      if (isHostRef.current) {
        fireAndForget(
          `/rooms/${roomId}?artistId=${resolvedArtistId}`,
          "DELETE"
        );
      } else {
        fireAndForget(
          `/rooms/${roomId}/exit?artistId=${resolvedArtistId}`,
          "POST"
        );
      }
    };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
      onPageHide();
    };
  }, [roomId, resolvedArtistId]);

  // 이미지 URL 감지 → GIF 전송 래퍼
  const IMAGE_URL =
    /^(https?:\/\/[^\s]+)\.(gif|webp|png|jpe?g|bmp)(\?.*)?$/i;
  const sendMessageSmart = (content: string) => {
    const v = (content ?? "").trim();
    if (!v) return Promise.resolve();

    if (!stompClient?.connected || !roomId || !myUser) {
      return Promise.resolve(sendMessage(v));
    }

    if (IMAGE_URL.test(v)) {
      sendGifMessage(stompClient, roomId, v, {
        id: String(myUser.userId),
        nick: String(myUser.nickname ?? ""),
      });
      return Promise.resolve();
    } else {
      return Promise.resolve(sendMessage(v));
    }
  };

  if (!room) {
    return (
      <>
        {isQuizModalOpen && (
          <EntryQuizModal
            question={entryQuestion ?? DEFAULT_QUIZ_PROMPT}
            onSubmit={handleSubmitAnswer}
            onExit={() => navigate("/")}
          />
        )}

        <KickedInfoModal
          isOpen={kickedOpen}
          title="입장 불가"
          description="해당 방에서 강퇴되어 입장이 불가합니다."
          confirmText="확인"
          onConfirm={() => {
            setKickedOpen(false);
            if (artistSlug) {
              navigate(`/artist/${artistSlug}`);
              return;
            }
            navigate("/");
          }}
          onClose={() => setKickedOpen(false)}
        />
        <div
          className="flex justify-center items-center h-screen bg-gray-900"
          style={
            isNativeApp
              ? {paddingTop: "env(safe-area-inset-top)"}
              : undefined
          }
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </>
    );
  }

  // 여기서도 혹시 모를 서버 변경 대비해서 한 번 더 안전하게
  const safePlaylist = Array.isArray(room.playlist)
    ? room.playlist
    : normalizePlaylist(room.playlist);

  const currentVideoId =
    safePlaylist?.[room.currentVideoIndex ?? 0] ?? safePlaylist?.[0] ?? "";

  // 공통: 비디오 블록 렌더러
  const renderVideoForWeb = () => (
    <div className="w-full max-w-full max-h-full aspect-video rounded-lg border border-gray-800 overflow-hidden">
      {stompClient ? (
        <VideoPlayer
          videoId={currentVideoId}
          isHost={room.hostId === myUserId}
          stompClient={stompClient}
          user={myUser!}
          roomId={room.roomId}
          playlist={safePlaylist}
          currentVideoIndex={room.currentVideoIndex ?? 0}
          isPlaylistUpdating={isPlaylistUpdating}
          onVideoEnd={handleVideoEnd}
          roomTitle={room.title ?? ""}
          hostNickname={room.hostNickname ?? myUser?.nickname}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          플레이어 연결 중...
        </div>
      )}
    </div>
  );

  // 앱 세로 모드에서의 비디오 렌더
  const renderVideoForAppPortrait = () => (
    <div className="relative w-full h-full bg-black">
      {stompClient ? (
        <VideoPlayer
          videoId={currentVideoId}
          isHost={room.hostId === myUserId}
          stompClient={stompClient}
          user={myUser!}
          roomId={room.roomId}
          playlist={safePlaylist}
          currentVideoIndex={room.currentVideoIndex ?? 0}
          isPlaylistUpdating={isPlaylistUpdating}
          onVideoEnd={handleVideoEnd}
          roomTitle={room.title ?? ""}
          hostNickname={room.hostNickname ?? myUser?.nickname}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          플레이어 연결 중...
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end pr-3 pb-3">
        <button
          type="button"
          className="pointer-events-auto w-7 h-7 rounded-full
                    bg-black/60 border border-white/40
                    flex items-center justify-center
                    text-white text-[15px]"
        >
          ↻
        </button>
      </div>
    </div>
  );


  // 웹 + (앱 가로) 레이아웃: 기존 구조 유지
  const webLikeBody = (
    <div className="flex flex-col md:flex-row flex-1 min-h-0">

      <main className="flex-1 min-h-0 bg-black px-3 pt-3 pb-2 md:p-4 flex justify-center items-start md:items-center overflow-hidden">
        {renderVideoForWeb()}
      </main>

      <aside
        className="w-full md:w-80 bg-gray-800 flex flex-col
                    border-t md:border-t-0 md:border-l border-gray-700
                    h-[42svh] md:h-auto
                    overflow-hidden flex-shrink-0
                    rounded-t-2xl md:rounded-none
                    shadow-[0_-8px_24px_rgba(0,0,0,0.85)] md:shadow-none"
      >

        <div className="flex flex-shrink-0 border-b border-t md:border-t-0 border-gray-700">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${activeTab === "chat"
                ? "text-white border-b-2 border-fuchsia-500"
                : "text-gray-400 hover:text-white"
              }`}
          >
            실시간 채팅
          </button>
          <button
            onClick={() => setActiveTab("playlist")}
            className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${activeTab === "playlist"
                ? "text-white border-b-2 border-fuchsia-500"
                : "text-gray-400 hover:text-white"
              }`}
          >
            플레이리스트
          </button>
        </div>

        <RightSidebar
          selectedTab={activeTab}
          isHost={room.hostId === myUserId}
          roomId={roomId}
          messages={visibleMessages}
          sendMessage={sendMessageSmart}
          playlist={safePlaylist}
          currentVideoIndex={room.currentVideoIndex ?? 0}
          onAddToPlaylist={handleAddToPlaylist}
          onSelectPlaylistIndex={handleJumpToIndex}
          onReorderPlaylist={handleReorderPlaylist}
          onDeletePlaylistItem={handleDeletePlaylistItem}
          onBlockUser={handleBlockUser}
          onEjectUser={handleEjectUser}
        />
      </aside>
    </div>
  );

  // 앱 세로 레이아웃: 영상 위 / 채팅 아래 (겹치지 않게)
  const appPortraitBody = (
    <div className="flex flex-col flex-1 min-h-0 bg-black">
      <main className="flex-1 flex justify-center items-center overflow-hidden">
        {renderVideoForAppPortrait()}
      </main>
      <aside
        className="w-full bg-gray-800 flex flex-col
                    border-t border-gray-700
                    h-[42svh]
                    overflow-hidden flex-shrink-0
                    rounded-t-2xl
                    shadow-[0_-8px_24px_rgba(0,0,0,0.85)]"
      >
        <div className="flex flex-shrink-0 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${activeTab === "chat"
                ? "text-white border-b-2 border-fuchsia-500"
                : "text-gray-400 hover:text-white"
              }`}
          >
            실시간 채팅
          </button>
          <button
            onClick={() => setActiveTab("playlist")}
            className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${activeTab === "playlist"
                ? "text-white border-b-2 border-fuchsia-500"
                : "text-gray-400 hover:text-white"
              }`}
          >
            플레이리스트
          </button>
        </div>

        <RightSidebar
          selectedTab={activeTab}
          isHost={room.hostId === myUserId}
          roomId={roomId}
          messages={visibleMessages}
          sendMessage={sendMessageSmart}
          playlist={safePlaylist}
          currentVideoIndex={room.currentVideoIndex ?? 0}
          onAddToPlaylist={handleAddToPlaylist}
          onSelectPlaylistIndex={handleJumpToIndex}
          onReorderPlaylist={handleReorderPlaylist}
          onDeletePlaylistItem={handleDeletePlaylistItem}
          onBlockUser={handleBlockUser}
          onEjectUser={handleEjectUser}
        />
      </aside>
    </div>
  );

  const mainBody =
    !isNativeApp || isLandscape ? webLikeBody : appPortraitBody;

  return (
    <div
      className="flex flex-col h-[100svh] bg-gray-900 text-white"
      style={
        isNativeApp ? {paddingTop: "env(safe-area-inset-top)"} : undefined
      }
    >
      <RoomDeletedModal
        isOpen={roomDeletedOpen}
        onConfirm={async () => {
          try {
            await stompClient?.deactivate();
          } catch { }
          navigate(-1);
        }}
      />
      {isQuizModalOpen && (
        <EntryQuizModal
          question={entryQuestion ?? DEFAULT_QUIZ_PROMPT}
          onSubmit={handleSubmitAnswer}
          onExit={() => navigate("/")}
        />
      )}

      {isKicked && (
        <EjectAlarmModal
          onClose={() => {
            setIsKicked(false);
            if (window.history.length > 1) {
              navigate(-1);
              return;
            }
            if (artistSlug) {
              navigate(`/artist/${artistSlug}`);
              return;
            }
            navigate("/");
          }}
        />
      )}

      {/* 재입장 금지(400) 모달 (room 로딩 후에도 안전하게 유지) */}
      <KickedInfoModal
        isOpen={kickedOpen}
        title="입장 불가"
        description="해당 방에서 강퇴되어 입장이 불가합니다."
        confirmText="확인"
        onConfirm={() => {
          setKickedOpen(false);
          if (artistSlug) {
            navigate(`/artist/${artistSlug}`);
            return;
          }
          navigate("/");
        }}
        onClose={() => setKickedOpen(false)}
      />

      {room && (
        <LiveHeader
          isHost={room.hostId === myUserId}
          title={room.title}
          hostId={room.hostId}
          hostNickname={hostNickname ?? room.hostNickname}
          hostRankLevel={room.hostRank?.rankLevel ?? "GREEN"}
          participantCount={participantCount ?? room.participantCount ?? 0}
          onExit={handleExit}
          onDelete={
            room.hostId === myUserId ? () => setIsDeleteOpen(true) : undefined
          }
          onSaveTitle={handleSaveTitle}
        />
      )}

      {mainBody}

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="방 삭제"
        description="정말 방을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDeleteRoom}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default LiveRoomPage;

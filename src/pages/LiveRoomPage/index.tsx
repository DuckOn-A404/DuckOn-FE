import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { enterRoom, exitRoom, deleteRoom, fetchRoomById } from "../../api/roomService";
import { useUserStore } from "../../store/useUserStore";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { createStompClient } from "../../socket";
import { updateRoomTitle } from "../../api/roomService";

import EntryQuizModal from "./EntryQuizModal";
import LiveHeader from "./LiveHeader";
import VideoPlayer from "./VideoPlayer";
import RightSidebar from "./RightSidebar";
import { useChatSubscription } from "../../hooks/useChatSubscription";
import ConnectionErrorModal from "../../components/common/modal/ConnectionErrorModal";
import RoomDeletedModal from "../../components/common/modal/RoomDeletedModal";
import ConfirmModal from "../../components/common/modal/ConfirmModal";
import { onTokenRefreshed, onRefreshState } from "../../api/axiosInstance";
import { fireAndForget } from "../../utils/fireAndForget";
import type { LiveRoomSyncDTO } from "../../types/Room";

const DEFAULT_QUIZ_PROMPT = "비밀번호(정답)를 입력하세요.";

/** 오래된 이벤트 무시용 타임스탬프 가드 */
const isNewerOrEqual = (evtLU?: number, prevLU?: number) => {
  if (typeof evtLU !== "number") return true;
  if (typeof prevLU !== "number") return true;
  return evtLU >= prevLU;
};

const LiveRoomPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation() as { state?: { artistId?: number } };
  const { myUser } = useUserStore();
  const myUserId = myUser?.userId;
  const navigate = useNavigate();

  const [room, setRoom] = useState<any>(null);
  const [hostNickname, setHostNickname] = useState<string | null>(null);

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "playlist">("chat");

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [entryQuestion, setEntryQuestion] = useState<string | null>(null);
  const { messages, sendMessage } = useChatSubscription(stompClient, roomId);

  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [isPlaylistUpdating, setIsPlaylistUpdating] = useState(false);
  const [roomDeletedOpen, setRoomDeletedOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const presenceRef = useRef<Client | null>(null);
  const syncRef = useRef<Client | null>(null);
  const lastTokenRef = useRef<string | null>(null);
  const leavingRef = useRef(false);
  const isHostRef = useRef(false);
  const joinedRef = useRef(false);

  // 리프레시/WS 핸드오버 상태
  const wsHandoverRef = useRef(false);
  const isRefreshingRef = useRef(false);

  const isHostView = !!(room && myUser && room.hostId === myUser.userId);

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
      } catch {}
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
      } catch {}
    }
  }, [roomId, resolvedArtistId, stompClient]);

  const handleExit = async () => {
    setParticipantCount((prev) =>
      typeof prev === "number" ? Math.max(0, prev - 1) : prev
    );
    try {
      await performExit();
    } catch {
      setParticipantCount((prev) => (typeof prev === "number" ? prev + 1 : prev));
    } finally {
      navigate(-1);
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
      setRoom(data);
      setIsQuizModalOpen(false);
      joinedRef.current = true;
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        const data = error.response?.data || {};
        const msg = (data?.message ?? "").toString();
        if (msg.includes("정답")) throw new Error("wrong_answer");

        const raw =
          (data.entryQuestion ??
            data.question ??
            data.quizQuestion ??
            "")?.toString()?.trim() || "";
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

    setRoom({ ...room, title: nextTitle, lastUpdated: now });

    try {
      await updateRoomTitle(roomId, nextTitle);
    } catch (err) {
      setRoom((r: any) => (r ? { ...r, title: prev } : r));
    }
  };

  const isHost = room?.hostId === myUserId;
  useEffect(() => {
    isHostRef.current = room?.hostId === myUserId;
  }, [room?.hostId, myUserId]);

  // 방장이 playlist 영상 추가
  const handleAddToPlaylist = (newVideoId: string) => {
    if (!stompClient?.connected || !myUser || !room) return;
    if (!isHost) return;

    setIsPlaylistUpdating(true);

    const updatedPlaylist = [...(room.playlist || []), newVideoId];

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      // title/hostNickname 전송 금지 (롤백 방지)
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
      // title/hostNickname 전송 금지
      playlist: room.playlist,
      currentVideoIndex: index,
      currentTime: 0,
      playing: true,
      lastUpdated: Date.now(),
    };

    setRoom((prev: any) => (prev ? { ...prev, ...payload } : prev));

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });
  };

  // 영상 끝
  const handleVideoEnd = () => {
    if (!isHost || !room || !room.playlist || !myUser) return;

    const { currentVideoIndex, playlist } = room;
    if (currentVideoIndex >= playlist.length - 1) return;

    const nextVideoIndex = currentVideoIndex + 1;

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      // title/hostNickname 전송 금지
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
      } catch {}
      presenceRef.current = null;
    };
  }, [roomId]);

  // 영상/채팅 동기화 구독
  useEffect(() => {
    if (!myUser || isQuizModalOpen || !roomId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

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
                // 기본 케이스: 그대로 표출
                setRoomDeletedOpen(true);
                return;

              case "ROOM_UPDATE":
                setRoom((prev: any) => {
                  if (!prev) return prev;
                  if (!isNewerOrEqual(evt.lastUpdated, prev.lastUpdated)) return prev;
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
                  if (!isNewerOrEqual(evt.lastUpdated, prev.lastUpdated)) return prev;
                  return {
                    ...prev,
                    // 제목/호스트명은 절대 덮지 않음
                    roomId: evt.roomId ?? prev.roomId,
                    hostId: evt.hostId ?? prev.hostId,
                    playlist: evt.playlist ?? prev.playlist,
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
    };

    syncClient.activate();

    return () => {
      try {
        sub?.unsubscribe();
      } catch {}
      try {
        syncClient.deactivate();
      } catch {}
      syncRef.current = null;
    };
  }, [myUser, myUserId, isQuizModalOpen, roomId, navigate]);

  // 리프레시 상태 구독 (삭제/퇴장 가드에 활용)
  useEffect(() => {
    const off = onRefreshState((st) => {
      isRefreshingRef.current = st === "start";
    });
    return () => { off() };
  }, []);

  // 무중단 재연결 유틸 (새 연결 성공 후에 기존 연결 해제)
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
          (async () => {
            try {
              await oldClient?.deactivate();
            } catch {}
            wsHandoverRef.current = false;
          })();
          resolve(next);
        };
        next.activate();
      });
    },
    []
  );

  // 액세스 토큰 갱신 → STOMP 무중단 재연결
  useEffect(() => {
    const unsubscribe = onTokenRefreshed(async (newToken) => {
      if (lastTokenRef.current === newToken) return;
      lastTokenRef.current = newToken;

      // 토큰 소실 시: 연결만 끊고 반환
      if (!newToken) {
        try { await presenceRef.current?.deactivate(); } catch {}
        try { await syncRef.current?.deactivate(); } catch {}
        presenceRef.current = null;
        syncRef.current = null;
        setStompClient(null);
        return;
      }

      // presence 교체
      if (roomId) {
        const topic = `/topic/room/${roomId}/presence`;
        const onPresence = (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            if (typeof data?.participantCount === "number") {
              setParticipantCount(data.participantCount);
            }
          } catch (e) {
            console.error("참가자 수 메시지 파싱 실패:", e);
          }
        };
        presenceRef.current = await seamlessReconnect(
          presenceRef.current,
          newToken,
          topic,
          onPresence
        );
      }

      // sync 교체
      if (myUser && !isQuizModalOpen && roomId) {
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
                // 리프레시/핸드오버 중 유령 삭제 신호는 무시
                if (isRefreshingRef.current || wsHandoverRef.current) return;
                setRoomDeletedOpen(true);
                return;

              case "ROOM_UPDATE":
                setRoom((prev: any) => {
                  if (!prev) return prev;
                  if (!isNewerOrEqual(evt.lastUpdated, prev.lastUpdated)) return prev;
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
                  if (!isNewerOrEqual(evt.lastUpdated, prev.lastUpdated)) return prev;
                  return {
                    ...prev,
                    roomId: evt.roomId ?? prev.roomId,
                    hostId: evt.hostId ?? prev.hostId,
                    playlist: evt.playlist ?? prev.playlist,
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
        };

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
  }, [roomId, myUser, isQuizModalOpen, seamlessReconnect]);

  // 최초 입장 시도
  // 방장은 본인이 만든 방이면 비밀번호 확인 없이 바로 입장
  useEffect(() => {
    let isMounted = true;
    const loadRoom = async () => {
      try {
        if (!roomId) return;

        // 방 메타 조회로 hostId 파악
        let imHost = false;
        try {
          const meta = await fetchRoomById(roomId);
          const hostIdFromMeta = meta?.hostId;
          imHost =
            myUserId != null &&
            hostIdFromMeta != null &&
            String(hostIdFromMeta) === String(myUserId);
        } catch {
          // 메타 조회 실패 시 그냥 기존 흐름으로
        }

        // 방장이라면 곧바로 enter (모달 금지)
        if (imHost) {
          const data = await enterRoom(roomId, "");
          if (!isMounted) return;
          setRoom(data);
          if (data && data.hostNickname) setHostNickname(data.hostNickname);
          joinedRef.current = true;
          setIsQuizModalOpen(false);
          return;
        }

        // 참가자: 비잠금은 통과, 잠금은 모달
        const data = await enterRoom(roomId, ""); // 빈 답 시도
        if (!isMounted) return;
        setRoom(data);
        if (data && data.hostNickname) setHostNickname(data.hostNickname);
        joinedRef.current = true;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          const data = err?.response?.data || {};
          const raw =
            (data.entryQuestion ??
              data.question ??
              data.quizQuestion ??
              "")?.toString()?.trim() || "";
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
  }, [roomId, myUserId]);

  // 이탈/언마운트 정리
  useEffect(() => {
    const onPageHide = () => {
      if (!roomId || !resolvedArtistId) return;
      if (!joinedRef.current) return;

      // 리프레시/WS 핸드오버 중이면 절대 삭제/퇴장 트리거하지 않음
      if (isRefreshingRef.current || wsHandoverRef.current) return;

      if (leavingRef.current) return;
      leavingRef.current = true;

      if (isHostRef.current) {
        // 방장: 방 삭제
        fireAndForget(`/rooms/${roomId}?artistId=${resolvedArtistId}`, "DELETE");
      } else {
        // 참가자: 방 나가기
        fireAndForget(`/rooms/${roomId}/exit?artistId=${resolvedArtistId}`, "POST");
      }
    };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
      onPageHide(); // 언마운트 시에도 한 번 시도
    };
  }, [roomId, resolvedArtistId]);

  if (!myUser) {
    return (
      <ConnectionErrorModal isOpen={true} onClose={() => navigate("/login")} />
    );
  }

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
        <div className="flex justify-center items-center h-screen bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-[100svh] bg-gray-900 text-white">
      <RoomDeletedModal
        isOpen={roomDeletedOpen}
        onConfirm={async () => {
          try { await stompClient?.deactivate(); } catch {}
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

      {room && (
        <LiveHeader
          isHost={room.hostId === myUserId}
          title={room.title}
          hostId={room.hostId}
          hostNickname={hostNickname ?? room.hostNickname}
          participantCount={participantCount ?? room.participantCount ?? 0}
          onExit={handleExit}
          onDelete={room.hostId === myUserId ? () => setIsDeleteOpen(true) : undefined}
          onSaveTitle={handleSaveTitle}
        />
      )}

      {/* 본문: 영상 + 사이드바 */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* 왼쪽: 영상 */}
        <main className="flex-1 min-h-0 bg-black p-4 flex justify-center items-center overflow-hidden">
          <div className="w-full max-w-full max-h-full aspect-video rounded-lg border border-gray-800 overflow-hidden">
            {stompClient ? (
              <VideoPlayer
                videoId={room.playlist?.[room.currentVideoIndex] ?? ""}
                isHost={room.hostId === myUserId}
                stompClient={stompClient}
                user={myUser!}
                roomId={room.roomId}
                playlist={room.playlist || []}
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
        </main>

        {/* 오른쪽: 사이드바 */}
        <aside
          className="w-full md:w-80 bg-gray-800 flex flex-col
                    border-t md:border-t-0 md:border-l border-gray-700
                    max-h-[44svh] md:max-h-none
                    overflow-hidden flex-shrink-0">
          {/* 탭 버튼 */}
          <div className="flex flex-shrink-0 border-b border-t md:border-t-0 border-gray-700">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${
                activeTab === "chat"
                  ? "text-white border-b-2 border-fuchsia-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              실시간 채팅
            </button>
            <button
              onClick={() => setActiveTab("playlist")}
              className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${
                activeTab === "playlist"
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
            messages={messages}
            sendMessage={sendMessage}
            playlist={room.playlist || []}
            currentVideoIndex={room.currentVideoIndex ?? 0}
            onAddToPlaylist={handleAddToPlaylist}
            onSelectPlaylistIndex={handleJumpToIndex}
          />
        </aside>
      </div>

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

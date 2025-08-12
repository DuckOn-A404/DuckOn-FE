import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { enterRoom, exitRoom, deleteRoom } from "../../api/roomService";
import { useUserStore } from "../../store/useUserStore";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { createStompClient } from "../../socket";

import EntryQuizModal from "./EntryQuizModal";
import LiveHeader from "./LiveHeader";
import VideoPlayer from "./VideoPlayer";
import RightSidebar from "./RightSidebar";
import { useChatSubscription } from "../../hooks/useChatSubscription";
import ConnectionErrorModal from "../../components/common/modal/ConnectionErrorModal";
import RoomDeletedModal from "../../components/common/modal/RoomDeletedModal";
import ConfirmModal from "../../components/common/modal/ConfirmModal";
import { onTokenRefreshed } from "../../api/axiosInstance";
import { fireAndForget } from "../../utils/fireAndForget";
import type { LiveRoomSyncDTO } from "../../types/Room";

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

  // [참가자 퇴장 로직]
  const performExit = useCallback(async () => {
    if (!roomId || !resolvedArtistId || leavingRef.current) return;
    leavingRef.current = true; // 중복 실행 방지

    try {
      await exitRoom(Number(roomId), resolvedArtistId);
    } catch (err) {
      console.error("퇴장 API 호출 실패:", err);
      throw err;
    } finally {
      // API 성공/실패와 관계없이 소켓 연결은 항상 종료
      try {
        await stompClient?.deactivate();
      } catch {}
    }
  }, [roomId, resolvedArtistId, stompClient]);

  // [방장 삭제 로직]
  const performDelete = useCallback(async () => {
    if (!roomId || !resolvedArtistId || leavingRef.current) return;
    leavingRef.current = true;
    try {
      await deleteRoom(Number(roomId), resolvedArtistId);
    } catch (err) {
      console.error("방 삭제 API 호출 실패:", err);
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
      await performExit(); // 핵심 정리 로직 호출
    } catch {
      // API 호출 실패 시 UI를 원래대로 되돌림
      setParticipantCount((prev) =>
        typeof prev === "number" ? prev + 1 : prev
      );
    } finally {
      navigate(-1); // 모든 작업이 끝난 후 페이지 이동
    }
  };

  // 기존 퇴장 코드
  // const handleExit = async () => {
  //   if (!roomId || leavingRef.current) return;
  //   if (!resolvedArtistId) {
  //     return;
  //   }
  //   leavingRef.current = true;

  //   // 내 화면에서 즉시 카운트 -1
  //   setRoom((prev: any) =>
  //     prev
  //       ? {
  //           ...prev,
  //           participantCount: Math.max(0, (prev.participantCount ?? 0) - 1),
  //         }
  //       : prev
  //   );
  //   setParticipantCount((prev) =>
  //     typeof prev === "number" ? Math.max(0, prev - 1) : prev
  //   );

  //   try {
  //     await exitRoom(Number(roomId), resolvedArtistId);
  //   } catch {
  //     setRoom((prev: any) =>
  //       prev
  //         ? { ...prev, participantCount: (prev.participantCount ?? 0) + 1 }
  //         : prev
  //     );
  //   } finally {
  //     try {
  //       await stompClient?.deactivate();
  //     } catch {}
  //     navigate(-1);
  //   }
  // };

  // 방삭제 버튼 클릭 시 실행되는 로직
  const handleDeleteRoom = async () => {
    if (!roomId || !resolvedArtistId) {
      setIsDeleteOpen(false);
      return;
    }
    try {
      await performDelete();
    } finally {
      setIsDeleteOpen(false);
      navigate("/"); // 삭제 후 홈으로
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    try {
      const data = await enterRoom(roomId!, answer);
      setRoom(data);
      setIsQuizModalOpen(false);
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401) {
        const msg = error.response?.data?.message || "";
        if (msg.includes("정답")) throw new Error("wrong_answer");
        alert("로그인이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }
      throw error;
    }
  };

  const isHost = room?.hostId === myUserId;

  useEffect(() => {
    isHostRef.current = room?.hostId === myUserId; // 최신 역할을 ref에 유지
  }, [room?.hostId, myUserId]);

  // 방장이 playlist 영상 추가 시 update publish
  const handleAddToPlaylist = (newVideoId: string) => {
    if (!stompClient?.connected || !myUser || !room) return;
    if (!isHost) return;

    setIsPlaylistUpdating(true);

    const updatedPlaylist = [...(room.playlist || []), newVideoId];

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      title: room.title,
      hostNickname: room.hostNickname ?? myUser.nickname,
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

    setTimeout(() => {
      setIsPlaylistUpdating(false);
    }, 3000);
  };

  const handleJumpToIndex = (index: number) => {
    if (!isHost || !stompClient?.connected || !room || !myUser) return

    const size = room.playlist?.length ?? 0;
    if (index < 0 || index >= size) return

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      title: room.title,
      hostNickname: room.hostNickname ?? myUser.nickname,
      playlist: room.playlist,
      currentVideoIndex: index,
      currentTime: 0,
      playing: true,
      lastUpdated: Date.now(),
    }

    setRoom((prev: any) => (prev ? { ...prev, ...payload } : prev));

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });
  }
  // 현재 영상 끝났을 때 관리
  const handleVideoEnd = () => {
    if (!isHost || !room || !room.playlist || !myUser) return;

    const { currentVideoIndex, playlist } = room;
    if (currentVideoIndex >= playlist.length - 1) {
      return;
    }

    const nextVideoIndex = currentVideoIndex + 1;

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      title: room.title,
      hostNickname: room.hostNickname ?? myUser.nickname,
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

  // 1) 참가자 수만 구독
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

  // 2) 영상/채팅 동기화용 구독 (로그인 필요)
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
              case "ROOM_DELETED": {
                setRoomDeletedOpen(true);
                return;
              }
              case "ROOM_UPDATE": {
                // 제목/호스트닉만 갱신
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
              }
              case "SYNC_STATE": {
                // 재생/플리/타임라인만 병합
                setRoom((prev: any) =>
                  prev
                    ? {
                        ...prev,
                        title: evt.title ?? prev.title,
                        hostNickname: evt.hostNickname ?? prev.hostNickname,
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
                      }
                    : prev
                );
                return;
              }
              default:
                // 알 수 없는/과거 이벤트 문자열은 무시
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

  // 방 정보 로딩, 비잠금 자동 입장 처리
  useEffect(() => {
    let isMounted = true;
    const loadRoom = async () => {
      try {
        if (!roomId) return;
        const data = await enterRoom(roomId, ""); // 항상 JSON 바디 {entryAnswer:""} 전송
        if (!isMounted) return;
        setRoom(data); // 성공이면 비잠금. 방장/참가자 여부는 data.hostId === myUser?.userId 로 판단

        if (data && data.hostNickname) {
          setHostNickname(data.hostNickname);
        }
        joinedRef.current = true;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 && err?.response?.data?.entryQuestion) {
          setEntryQuestion(err.response.data.entryQuestion);
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
  }, [roomId]);

  // ================================================================================
  // 4) 액세스 토큰 갱신 이벤트 → 모든 STOMP 재연결
  //    - null 토큰(로그아웃/리프레시 실패) 처리
  //    - 동일 토큰이면 재연결 스킵
  // ================================================================================
  useEffect(() => {
    const off = onTokenRefreshed(async (newToken) => {
      if (lastTokenRef.current === newToken) return;
      lastTokenRef.current = newToken;

      // 토큰이 없어졌다면 전부 끊고 종료
      if (!newToken) {
        try {
          await presenceRef.current?.deactivate();
        } catch {}
        try {
          await syncRef.current?.deactivate();
        } catch {}
        presenceRef.current = null;
        syncRef.current = null;
        setStompClient(null);
        return;
      }

      // presence 재연결
      if (roomId) {
        try {
          await presenceRef.current?.deactivate();
        } catch {}
        const p = createStompClient(newToken);
        presenceRef.current = p;
        p.onConnect = () => {
          p.subscribe(`/topic/room/${roomId}/presence`, (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              setParticipantCount(data.participantCount);
            } catch (e) {
              console.error("참가자 수 메시지 파싱 실패:", e);
            }
          });
        };
        p.activate();
      }

      // 영상/채팅 재연결
      if (myUser && !isQuizModalOpen && roomId) {
        try {
          await syncRef.current?.deactivate();
        } catch {}
        const s = createStompClient(newToken);
        syncRef.current = s;
        setStompClient(s);

        s.onConnect = () => {
          s.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
            try {
              const evt = JSON.parse(message.body) as LiveRoomSyncDTO;
              const t = evt?.eventType;

              if (typeof evt?.participantCount === "number")
                setParticipantCount(evt.participantCount);

              switch (t) {
                case "ROOM_DELETED": {
                  setRoomDeletedOpen(true);
                  return;
                }
                case "ROOM_UPDATE": {
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
                }
                case "SYNC_STATE": {
                  setRoom((prev: any) =>
                    prev
                      ? {
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
                        }
                      : prev
                  );
                  return;
                }
                default:
                  return;
              }
            } catch (error) {
              console.error("방 상태 업데이트 메시지 파싱 실패:", error);
            }
          });
        };

        s.activate();
      }
    });

    return () => {
      off();
    };
  }, [roomId, myUser, isQuizModalOpen, myUserId]);

  // // 페이지 이탈했을 때 자동 정리 로직
  // useEffect(() => {
  //   return () => {
  //     // 아직 입장 전이거나, 이미 나가는 중이면 아무 것도 안 함
  //     if (!joinedRef.current || leavingRef.current) return;

  //     leavingRef.current = true;
  //     if (isHostRef.current) {
  //       void performDelete();
  //     } else {
  //       void performExit();
  //     }
  //   };
  // }, []);

  // // 브라우저 차원에서 방을 나갔을 경우 처리 로직
  // useEffect(() => {
  //   if (!roomId || !resolvedArtistId) return;

  //   const onPageHide = () => {
  //     if (!joinedRef.current || leavingRef.current) return;

  //     leavingRef.current = true;
  //     if (isHostRef.current) {
  //       fireAndForget(
  //         `/rooms/${roomId}?artistId=${resolvedArtistId}`,
  //         "DELETE"
  //       );
  //     } else {
  //       fireAndForget(
  //         `/rooms/${roomId}/exit?artistId=${resolvedArtistId}`,
  //         "POST"
  //       );
  //     }
  //   };

  //   window.addEventListener("pagehide", onPageHide);
  //   window.addEventListener("beforeunload", onPageHide);

  //   return () => {
  //     window.removeEventListener("pagehide", onPageHide);
  //     window.removeEventListener("beforeunload", onPageHide);
  //   };
  // }, [roomId, resolvedArtistId]);

  // 1. 페이지 이탈/언마운트 시 실행될 정리 로직을 하나로 통합합니다.
  useEffect(() => {
    // 아직 방에 입장하지 않았거나, 필수 ID가 없으면 아무것도 등록하지 않음
    if (!joinedRef.current || !roomId || !resolvedArtistId) {
      return;
    }

    const cleanup = () => {
      // 중복 실행 방지
      if (leavingRef.current) return;
      leavingRef.current = true;

      // state 대신 ref를 사용하여 가장 최신 isHost 값을 기준으로 판단
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

    // 브라우저 탭/창 닫기 등
    window.addEventListener("pagehide", cleanup);

    // 컴포넌트 언마운트 시 (뒤로가기, 다른 페이지로 이동 등)
    return () => {
      window.removeEventListener("pagehide", cleanup);
      cleanup();
    };
  }, [roomId, resolvedArtistId]);

  if (!myUser) {
    return (
      <ConnectionErrorModal isOpen={true} onClose={() => navigate("/login")} />
    );
  }

  if (!room) {
    // 로딩 상태를 room 존재 여부로 단순화
    return (
      <>
        {isQuizModalOpen && entryQuestion && (
          <EntryQuizModal
            question={entryQuestion}
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

  // if (!room || !myUser) {
  //   return (
  //     <>
  //       <RoomDeletedModal
  //         isOpen={roomDeletedOpen}
  //         onConfirm={async () => {
  //           try {
  //             await stompClient?.deactivate();
  //           } catch {}
  //           navigate(-1);
  //         }}
  //       />
  //       {isQuizModalOpen && entryQuestion && (
  //         <EntryQuizModal
  //           question={entryQuestion}
  //           onSubmit={handleSubmitAnswer}
  //           onExit={() => navigate("/")}
  //         />
  //       )}
  //       <div className="flex justify-center items-center h-24">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  //       </div>
  //     </>
  //   );
  // }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <RoomDeletedModal
        isOpen={roomDeletedOpen}
        onConfirm={async () => {
          try {
            await stompClient?.deactivate();
          } catch {}
          navigate(-1);
        }}
      />
      {isQuizModalOpen && entryQuestion && (
        <EntryQuizModal
          question={entryQuestion}
          onSubmit={handleSubmitAnswer}
          onExit={() => navigate("/")}
        />
      )}

      {/* 상단 헤더 */}
      <LiveHeader
        isHost={room.hostId === myUserId}
        title={room.title}
        hostId={room.hostId}
        hostNickname={hostNickname ?? room.hostNickname}
        participantCount={participantCount ?? room.participantCount ?? 0}
        onExit={handleExit}
        onDelete={
          room.hostId === myUserId ? () => setIsDeleteOpen(true) : undefined
        }
      />

      {/* 본문: 영상 + 사이드바 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽: 영상 */}
        <main className="flex-1 bg-black p-4">
          <div className="w-full h-full rounded-lg border border-gray-800 overflow-hidden">
            {stompClient ? (
              <VideoPlayer
                videoId={room.playlist?.[room.currentVideoIndex] ?? ""}
                isHost={isHost}
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
        <aside className="w-80 bg-gray-800 flex flex-col border-l border-gray-700">
          {/* 탭 버튼 */}
          <div className="flex border-b border-gray-700">
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
            isHost={isHost}
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
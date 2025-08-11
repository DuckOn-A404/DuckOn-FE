import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  fetchRoomById,
  enterRoom,
  exitRoom,
  deleteRoom,
} from "../../api/roomService";
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

const LiveRoomPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation() as { state?: { artistId?: number } };
  const { myUser } = useUserStore();
  const myUserId = myUser?.userId;
  const navigate = useNavigate();

  const [room, setRoom] = useState<any>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "playlist">("chat");

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [entryQuestion, setEntryQuestion] = useState<string | null>(null);
  const { messages, sendMessage } = useChatSubscription(stompClient, roomId);

  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [isPlaylistUpdating, setIsPlaylistUpdating] = useState(false);
  const [roomDeletedOpen, setRoomDeletedOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // 비번 없는 방에서 참가자 자동입장 중복 방지
  const autoEnterTriedRef = useRef(false);

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

  const leavingRef = useRef(false);

  const handleExit = async () => {
    if (!roomId || leavingRef.current) return;
    if (!resolvedArtistId) {
      return;
    }
    leavingRef.current = true;

    // 내 화면에서 즉시 카운트 -1
    setRoom((prev: any) =>
      prev
        ? {
            ...prev,
            participantCount: Math.max(0, (prev.participantCount ?? 0) - 1),
          }
        : prev
    );
    setParticipantCount((prev) =>
      typeof prev === "number" ? Math.max(0, prev - 1) : prev
    );

    try {
      // 퇴장 api 호출
      await exitRoom(Number(roomId), resolvedArtistId);
    } catch {
      setRoom((prev: any) =>
        prev
          ? { ...prev, participantCount: (prev.participantCount ?? 0) + 1 }
          : prev
      );
    } finally {
      // 이전 페이지 이동
      try {
        await stompClient?.deactivate();
      } catch {}
      navigate(-1);
    }
  };

  const handleDeleteRoom = async () => {
    // if (!roomId) return;
    // if (!resolvedArtistId) {
    //   alert("artistId를 확인할 수 없습니다.");
    if (!roomId || !resolvedArtistId) {
      setIsDeleteOpen(false)
      return
    }

    try {
      await deleteRoom(Number(roomId), resolvedArtistId)
    } catch (e) {
      console.warn("방 삭제 중 오류:", e)
    } finally {
      setIsDeleteOpen(false)
      try { await stompClient?.deactivate(); } catch {}
      navigate("/");
    }
  }
  //   if (!confirm("정말 방을 삭제하시겠습니까?")) return;

  //   try {
  //     await deleteRoom(Number(roomId), resolvedArtistId);
  //   } catch (e) {
  //     console.warn("방 삭제 중 오류:", e);
  //   } finally {
  //     try {
  //       await stompClient?.deactivate();
  //     } catch {}
  //     navigate("/");
  //   }
  // };

  const handleSubmitAnswer = async (answer: string) => {
    try {
      await enterRoom(roomId!, answer);
      const roomData = await fetchRoomById(roomId!);
      setRoom(roomData);
      setIsQuizModalOpen(false); // 성공 시 모달 닫기
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 401) {
        const serverMessage = error.response?.data?.message || "";

        if (serverMessage.includes("정답")) {
          // 정답이 틀렸을 경우 => EntryQuizModal.tsx에서 "wrong_answer"로 처리
          throw new Error("wrong_answer");
        }

        // 그 외의 인증 오류는 로그인 필요
        alert("로그인이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      throw error;
    }
  };

  const isHost = room?.hostId === myUserId;

  // 방장이 playlist 영상 추가 시 update publish
  const handleAddToPlaylist = (newVideoId: string) => {
    if (!stompClient?.connected || !myUser || !room) return;
    if (!isHost) return;

    setIsPlaylistUpdating(true);

    const updatedPlaylist = [...(room.playlist || []), newVideoId];

    const payload = {
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

    setTimeout(() => {
      setIsPlaylistUpdating(false);
    }, 3000);
  };

  // 현재 영상 끝났을 때 관리
  const handleVideoEnd = () => {
    // 방장이 아니거나, 플레이리스트가 없으면 아무것도 안 함
    if (!isHost || !room || !room.playlist || !myUser) return;

    const { currentVideoIndex, playlist } = room;

    if (currentVideoIndex >= playlist.length - 1) {
      return;
    }

    const nextVideoIndex = currentVideoIndex + 1;

    const payload = {
      roomId: Number(room.roomId),
      hostId: myUser.userId,
      playlist: room.playlist,
      currentVideoIndex: nextVideoIndex,
      currentTime: 0,
      playing: true,
      lastUpdated: Date.now(),
    };

    // 서버로 다음 영상 정보 전송
    stompClient?.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });

    setRoom((prev: any) => ({
      ...prev,
      ...payload,
    }));
  };

  // 참가자 수 구독용 useEffect
  // ================================================================================
  // 1. 참가자 수만 전문적으로 구독하는 useEffect
  // 이 코드는 로그인 여부와 관계없이 페이지에 들어오면 바로 실행됩니다.
  // ================================================================================
  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("accessToken");
    const presenceClient = createStompClient(token || "");

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

    presenceClient.onStompError = (frame) => {
      console.error("참가자 수 STOMP 에러:", frame.headers["message"]);
    };

    presenceClient.onWebSocketError = () => {
    };

    presenceClient.activate();

    return () => {
      presenceClient.deactivate();
    };
  }, [roomId]);

  // ================================================================================
  // 2. 영상/채팅 동기화를 위한 useEffect
  // 이 코드는 로그인을 해야만 실행됩니다.
  // ================================================================================
  // useEffect(() => {
  //   // 로그인한 유저가 아니거나, 퀴즈 모달이 열려있으면 연결하지 않습니다.
  //   if (!myUser || isQuizModalOpen) return;

  //   const token = localStorage.getItem("accessToken");
  //   if (!token) return;

  //   // onConnect 콜백을 createStompClient에 직접 전달하여 코드를 간결하게 만듭니다.
  //   const syncClient = createStompClient(token);

  //   syncClient.onConnect = () => {
  //     console.log("영상/채팅 동기화용 STOMP 연결 성공");
  //     setStompClient(syncClient); // 채팅과 영상 제어에 사용할 클라이언트 설정

  //     // 방장이 아닐 때만 영상 동기화 메시지를 구독합니다.
  //     if (!isHost) {
  //       syncClient.subscribe(`/topic/room/${roomId}`, (message) => {
  //         try {
  //           const updatedData = JSON.parse(message.body);
  //           // participantCount는 다른 채널에서 받으므로 이 데이터는 무시합니다.
  //           const { participantCount, ...restData } = updatedData;
  //           setRoom((prevRoom: any) => ({
  //             ...prevRoom,
  //             ...restData,
  //           }));
  //         } catch (error) {
  //           console.error("방 상태 업데이트 메시지 파싱 실패:", error);
  //         }
  //       });
  //     }
  //   };

  //   syncClient.onStompError = (frame) => {
  //     console.error("영상/채팅 동기화 STOMP 에러:", frame);
  //   };

  //   syncClient.activate();

  //   return () => {
  //     syncClient.deactivate();
  //   };
  // }, [myUser, isQuizModalOpen, roomId, isHost]);

  // 1차 수정
  // useEffect(() => {
  //   if (!myUser || isQuizModalOpen) return;

  //   const token = localStorage.getItem("accessToken");
  //   if (!token) return;

  //   const syncClient = createStompClient(token);

  //   syncClient.onConnect = () => {
  //     setStompClient(syncClient);

  //     // 이벤트/상태 동기화 수신 (방장/참가자 공통으로 받아도 무방)
  //     syncClient.subscribe(`/topic/room/${roomId}`, (message) => {
  //       try {
  //         const evt = JSON.parse(message.body);
  //         const t = evt?.eventType as string | undefined;

  //         // 서버가 항상 participantCount를 포함해 주면 여기서 동기화
  //         if (typeof evt?.participantCount === "number") {
  //           setParticipantCount(evt.participantCount);
  //         }

  //         if (!t) {
  //           // 타입 없는 부분 업데이트 → 안전 병합
  //           const { participantCount: _omit, ...rest } = evt ?? {};
  //           setRoom((prev: any) => ({ ...prev, ...rest }));
  //           return;
  //         }

  //         switch (t) {
  //           case "HOST_CHANGED": {
  //             setRoom((prev: any) =>
  //               prev
  //                 ? {
  //                     ...prev,
  //                     hostId: evt.hostId ?? prev.hostId,
  //                     lastUpdated: evt.lastUpdated ?? prev.lastUpdated,
  //                   }
  //                 : prev
  //             );
  //             if (evt.hostId && evt.hostId === myUserId) {
  //               console.info("방장 권한이 위임되었습니다.");
  //             }
  //             return;
  //           }

  //           case "USER_LEFT":
  //           case "USER_JOINED": {
  //             // participantCount는 위에서 이미 반영
  //             return;
  //           }

  //           case "ROOM_DELETED": {
  //             console.info("방이 삭제되었습니다.");
  //             try { await stompClient?.deactivate() } catch {}
  //             navigate("/");
  //             return;
  //           }

  //           case "STATE_SYNC": {
  //             if (evt.room) setRoom(evt.room);
  //             return;
  //           }

  //           default: {
  //             const { participantCount: _omit, ...rest } = evt ?? {};
  //             setRoom((prev: any) => ({ ...prev, ...rest }));
  //             return;
  //           }
  //         }
  //       } catch (error) {
  //         console.error("방 상태 업데이트 메시지 파싱 실패:", error);
  //       }
  //     });
  //   };

  //   syncClient.onStompError = (frame) => {
  //     console.error("영상/채팅 동기화 STOMP 에러:", frame);
  //   };

  //   syncClient.activate();
  //   return () => {
  //     syncClient.deactivate();
  //   };
  // }, [myUser, isQuizModalOpen, roomId, isHost]);

  // 2차 수정
  useEffect(() => {
    if (!myUser || isQuizModalOpen || !roomId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const syncClient = createStompClient(token);
    let sub: StompSubscription | null = null;

    syncClient.onConnect = () => {
      setStompClient(syncClient);

      // async 콜백 + syncClient 사용
      sub = syncClient.subscribe(
        `/topic/room/${roomId}`,
        async (message: IMessage) => {
          try {
            const evt = JSON.parse(message.body);
            const t = evt?.eventType as string | undefined;

            if (typeof evt?.participantCount === "number") {
              setParticipantCount(evt.participantCount);
            }

            if (!t) {
              const { participantCount: _omit, ...rest } = evt ?? {};
              setRoom((prev: any) => ({ ...prev, ...rest }));
              return;
            }

            switch (t) {
              // case "HOST_CHANGED": {
              //   setRoom((prev: any) =>
              //     prev
              //       ? {
              //           ...prev,
              //           hostId: evt.hostId ?? prev.hostId,
              //           lastUpdated: evt.lastUpdated ?? prev.lastUpdated,
              //         }
              //       : prev
              //   );
              //   if (evt.hostId && evt.hostId === myUserId) {
              //     console.info("방장 권한이 위임되었습니다.");
              //   }
              //   return;
              // }

              case "HOST_CHANGED": {
                setRoom((prev: any) =>
                  prev ? { ...prev, hostId: evt.hostId ?? prev.hostId, lastUpdated: evt.lastUpdated ?? prev.lastUpdated } : prev
                );
                if (evt.hostId === myUserId) console.info("방장 권한이 위임되었습니다.");
                return;
              }


              case "USER_LEFT":
              case "USER_JOINED":
                return;

              case "ROOM_DELETED": {
                setRoomDeletedOpen(true);
                return;
              }

              case "STATE_SYNC": {
                if (evt.room) setRoom(evt.room);
                return;
              }

              default: {
                const { participantCount: _omit, ...rest } = evt ?? {};
                setRoom((prev: any) => ({ ...prev, ...rest }));
                return;
              }
            }
          } catch (error) {
            console.error("방 상태 업데이트 메시지 파싱 실패:", error);
          }
        }
      );
    };

    syncClient.onStompError = (frame) => {
      console.error("영상/채팅 동기화 STOMP 에러:", frame);
    };

    // 소켓 레벨 에러도 표시
    syncClient.onWebSocketError = () => {
    };

    syncClient.activate();

    return () => {
      try {
        sub?.unsubscribe();
      } catch {}
      syncClient.deactivate();
    };
    // isHost 제거, 대신 myUserId/navigate 추가
  }, [myUser, myUserId, isQuizModalOpen, roomId, navigate]);

  // 방 정보 로딩, 비잠금 자동 입장 처리
  useEffect(() => {
    const loadRoom = async () => {
      try {
        if (!roomId) return;
        const roomData = await fetchRoomById(roomId);

        const isHostView = roomData.hostId === myUser?.userId;
        const hasQuiz = Boolean(roomData.entryQuestion);

        // 1. 방장
        if (isHostView) {
          setRoom(roomData);
          return;
        }

        // 2. 참가자, 비번 존재. 모달 오픈, 정답 제출 시 enterRoom 호출
        if (hasQuiz) {
          setEntryQuestion(roomData.entryQuestion);
          setIsQuizModalOpen(true);
          return;
        }

        // 3. 참가자, 비번 존재x 최초 진입 시 자동으로 enterRoom 1회 호출
        if (!autoEnterTriedRef.current) {
          autoEnterTriedRef.current = true;
          try {
            await enterRoom(roomId, ""); // 빈 문자열로 자동 입장
          } catch (err: any) {
            const status = err?.response?.status;
            if (status === 409) {
            } else if (status === 401 && err?.response?.data?.entryQuestion) {
              setEntryQuestion(err.response.data.entryQuestion);
              setIsQuizModalOpen(true);
              return;
            } else {
              console.warn("입장 실패", err);
            }
          } finally {
            const fresh = await fetchRoomById(roomId);
            setRoom(fresh);
          }
          return;
        }

        setRoom(roomData);
      } catch (error) {
        console.error("방 정보 불러오기 실패:", error);
      }
    };
    loadRoom();
  }, [roomId, myUser?.userId]);

  // if (!room || !stompClient?.connected || !myUser) {
  // 로그인 안되어있으면 못들어가게..
  if (!myUser) {
    return (
      <ConnectionErrorModal isOpen={true} onClose={() => navigate("/login")} />
    );
  }

  if (!room || !myUser) {
    return (
      <>
        <RoomDeletedModal
          isOpen={roomDeletedOpen}
          onConfirm={async () => {
            try { await stompClient?.deactivate(); } catch {}
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
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </>
    );
  }

  return (
    // 전체 레이아웃
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <RoomDeletedModal
        isOpen={roomDeletedOpen}
        onConfirm={async () => {
          try { await stompClient?.deactivate(); } catch {}
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
        participantCount={participantCount ?? room.participantCount ?? 0}
        onExit={handleExit}
        onDelete={room.hostId === myUserId ? () => setIsDeleteOpen(true) : undefined}
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

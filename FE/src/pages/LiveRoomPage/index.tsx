import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { fetchRoomById, enterRoom, exitRoom } from "../../api/roomService";
import { useUserStore } from "../../store/useUserStore";
import { Client, type IMessage } from "@stomp/stompjs";
import { createStompClient } from "../../socket";

import EntryQuizModal from "./EntryQuizModal";
import LiveHeader from "./LiveHeader";
import VideoPlayer from "./VideoPlayer";
import RightSidebar from "./RightSidebar";
import { useChatSubscription } from "../../hooks/useChatSubscription";
import ConnectionErrorModal from "../../components/common/modal/ConnectionErrorModal";

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

  const [connectionError, setConnectionError] = useState(false);

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

    try {
      // 퇴장 api 호출
      await exitRoom(Number(roomId), resolvedArtistId);
    } catch (e) {
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
  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("accessToken");
    const presenceClient = createStompClient(token || "");

    presenceClient.onConnect = () => {
      console.log("✅ 참가자 수 구독용 STOMP 연결 성공");
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
      setConnectionError(true);
    };

    presenceClient.onWebSocketError = () => {
      setConnectionError(true);
    };

    presenceClient.activate();

    return () => {
      presenceClient.deactivate();
    };
  }, [roomId]);

  // // 영상/채팅 동기화용 useEffect
  // useEffect(() => {
  //   if (!myUser || isQuizModalOpen) return;

  //   if (isHost) {
  //     const client = createStompClient(
  //       localStorage.getItem("accessToken") || ""
  //     );
  //     client.onConnect = () => {
  //       console.log("STOMP 연결 성공 (방장)");
  //       setStompClient(client);
  //     };
  //     client.activate();
  //     return () => {
  //       client.deactivate();
  //     };
  //   }

  //   const client = createStompClient(localStorage.getItem("accessToken") || "");

  //   client.onConnect = () => {
  //     console.log("STOMP 연결 성공 (참가자) ");
  //     setStompClient(client);

  //     client.subscribe(`/topic/room/${roomId}`, (message) => {
  //       try {
  //         const updatedData = JSON.parse(message.body);
  //         console.log("서버로부터 방 상태 업데이트 수신:", updatedData);

  //         setRoom((prevRoom: any) => ({
  //           ...prevRoom,
  //           ...updatedData,
  //         }));
  //       } catch (error) {
  //         console.error("방 상태 업데이트 메시지 파싱 실패:", error);
  //       }
  //     });
  //   };

  //   client.onStompError = (frame) => {
  //     console.error("STOMP 에러 발생:", frame);
  //   };

  //   client.activate();

  //   return () => {
  //     client.deactivate();
  //   };
  // }, [myUser, isQuizModalOpen, roomId, isHost]);

  // ================================================================================
  // 1. 참가자 수만 전문적으로 구독하는 useEffect
  // 이 코드는 로그인 여부와 관계없이 페이지에 들어오면 바로 실행됩니다.
  // ================================================================================
  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("accessToken");
    // 비로그인 유저도 참가자 수는 볼 수 있어야 하므로, 토큰이 없어도 연결을 시도합니다.
    const presenceClient = createStompClient(token || "");

    presenceClient.onConnect = () => {
      console.log("✅ 참가자 수 구독용 STOMP 연결 성공");
      presenceClient.subscribe(
        `/topic/room/${roomId}/presence`,
        (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            // 실시간으로 받은 참가자 수를 state에 저장합니다.
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

    presenceClient.activate();

    // 페이지를 나갈 때 연결을 해제합니다.
    return () => {
      presenceClient.deactivate();
    };
  }, [roomId]);

  // ================================================================================
  // 2. 영상/채팅 동기화를 위한 useEffect
  // 이 코드는 로그인을 해야만 실행됩니다.
  // ================================================================================
  useEffect(() => {
    // 로그인한 유저가 아니거나, 퀴즈 모달이 열려있으면 연결하지 않습니다.
    if (!myUser || isQuizModalOpen) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // onConnect 콜백을 createStompClient에 직접 전달하여 코드를 간결하게 만듭니다.
    const syncClient = createStompClient(token);

    syncClient.onConnect = () => {
      console.log("✅ 영상/채팅 동기화용 STOMP 연결 성공");
      setStompClient(syncClient); // 채팅과 영상 제어에 사용할 클라이언트 설정

      // 방장이 아닐 때만 영상 동기화 메시지를 구독합니다.
      if (!isHost) {
        syncClient.subscribe(`/topic/room/${roomId}`, (message) => {
          try {
            const updatedData = JSON.parse(message.body);
            // participantCount는 다른 채널에서 받으므로 이 데이터는 무시합니다.
            const { participantCount, ...restData } = updatedData;
            setRoom((prevRoom: any) => ({
              ...prevRoom,
              ...restData,
            }));
          } catch (error) {
            console.error("방 상태 업데이트 메시지 파싱 실패:", error);
          }
        });
      }
    };

    syncClient.onStompError = (frame) => {
      console.error("영상/채팅 동기화 STOMP 에러:", frame);
    };

    syncClient.activate();

    return () => {
      syncClient.deactivate();
    };
  }, [myUser, isQuizModalOpen, roomId, isHost]);

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
              console.log("statust 409");
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

  if (!room || !stompClient?.connected || !myUser) {
    return (
      <>
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
      {isQuizModalOpen && entryQuestion && (
        <EntryQuizModal
          question={entryQuestion}
          onSubmit={handleSubmitAnswer}
          onExit={() => navigate("/")}
        />
      )}
      {/* 에러 발생 시 모달 */}
      <ConnectionErrorModal
        isOpen={connectionError}
        onClose={() => {
          setConnectionError(false);
          navigate(-1);
        }}
      />

      {/* 상단 헤더 */}
      <LiveHeader
        isHost={room.hostId === myUserId}
        title={room.title}
        hostId={room.hostId}
        participantCount={participantCount ?? room.participantCount ?? 0}
        onExit={handleExit}
      />

      {/* 본문: 영상 + 사이드바 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽: 영상 */}
        <main className="flex-1 bg-black p-4">
          <div className="w-full h-full rounded-lg border border-gray-800 overflow-hidden">
            <VideoPlayer
              videoId={room.playlist[room.currentVideoIndex]}
              isHost={isHost}
              stompClient={stompClient}
              user={myUser!}
              roomId={room.roomId}
              playlist={room.playlist || []}
              currentVideoIndex={room.currentVideoIndex ?? 0}
              isPlaylistUpdating={isPlaylistUpdating}
              onVideoEnd={handleVideoEnd}
            />
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
    </div>
  );
};

export default LiveRoomPage;

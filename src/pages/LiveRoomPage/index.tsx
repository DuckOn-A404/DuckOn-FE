import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRoomById, enterRoom } from "../../api/roomService";
import { useUserStore } from "../../store/useUserStore";
import { Client } from "@stomp/stompjs";
import { createStompClient } from "../../socket";

import EntryQuizModal from "./EntryQuizModal";
import LiveHeader from "./LiveHeader";
import VideoPlayer from "./VideoPlayer";
import RightSidebar from "./RightSidebar";
import { useChatSubscription } from "../../hooks/useChatSubscription";

const LiveRoomPage = () => {
  const { roomId } = useParams();
  const { myUser } = useUserStore();
  const myUserId = myUser?.userId;
  const navigate = useNavigate();

  const [room, setRoom] = useState<any>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "playlist">("chat");

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [entryQuestion, setEntryQuestion] = useState<string | null>(null);
  const { messages, sendMessage } = useChatSubscription(stompClient, roomId);

  const [isPlaylistUpdating, setIsPlaylistUpdating] = useState(false);

  const handleExit = () => {
    stompClient?.deactivate();
    navigate(-1);
  };

  const handleSubmitAnswer = async (answer: string) => {
    console.log("제출된 정답:", answer);
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

      // 기타 예외
      console.error("입장 실패:", error);
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
      console.log("플레이리스트 마지막 영상입니다.");
      return;
    }

    const nextVideoIndex = currentVideoIndex + 1;

    console.log(`[방장] 영상 종료, 다음 트랙으로: ${nextVideoIndex}`);

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

  useEffect(() => {
    if (!myUser || isQuizModalOpen) return;

    if (isHost) {
      const client = createStompClient(
        localStorage.getItem("accessToken") || ""
      );
      client.onConnect = () => {
        console.log("STOMP 연결 성공 (방장)");
        setStompClient(client);
      };
      client.activate();
      return () => {
        client.deactivate();
      };
    }

    const client = createStompClient(localStorage.getItem("accessToken") || "");

    client.onConnect = () => {
      console.log("STOMP 연결 성공 (참가자) ");
      setStompClient(client);

      client.subscribe(`/topic/room/${roomId}`, (message) => {
        try {
          const updatedData = JSON.parse(message.body);
          console.log("서버로부터 방 상태 업데이트 수신:", updatedData);

          setRoom((prevRoom: any) => ({
            ...prevRoom,
            ...updatedData,
          }));
        } catch (error) {
          console.error("방 상태 업데이트 메시지 파싱 실패:", error);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP 에러 발생:", frame);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [myUser, isQuizModalOpen, roomId, isHost]);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        if (!roomId) return;
        const roomData = await fetchRoomById(roomId);

        // 참가자이고 퀴즈가 존재하면 모달 오픈하기
        if (roomData.hostId !== myUser?.userId && roomData.entryQuestion) {
          setEntryQuestion(roomData.entryQuestion);
          setIsQuizModalOpen(true);
        } else {
          setRoom(roomData);
        }
      } catch (error) {
        console.error("방 정보 불러오기 실패:", error);
      }
    };
    loadRoom();
  }, [roomId]);

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
        <div>로딩 중...</div>
      </>
    );
  }
  // if (!room || !stompClient?.connected || !myUser || isQuizModalOpen) return <div>로딩 중...</div>;

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
      {/* 상단 헤더 */}
      <LiveHeader
        isHost={room.hostId === myUserId}
        title={room.title}
        hostId={room.hostId}
        participandCount={room.participants?.length || 0}
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

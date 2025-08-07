import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRoomById } from "../../api/roomService";
import { useUserStore } from "../../store/useUserStore";
import { Client } from "@stomp/stompjs";
import { createStompClient } from "../../socket";

// 1. 페이지를 구성하는 자식 컴포넌트들을 import 합니다.
import LiveHeader from "./LiveHeader";
import VideoPlayer from "./VideoPlayer";
import RightSidebar from "./RightSidebar";
import { useChatSubscription } from "../../hooks/useChatSubscription";

const LiveRoomPage = () => {
  const { roomId } = useParams();
  const { myUser } = useUserStore();
  const myUserId = myUser?.userId;
  const [room, setRoom] = useState<any>(null);
  const navigate = useNavigate();

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "playlist">("chat");

  const { messages, sendMessage } = useChatSubscription(stompClient, roomId);

  const handleExit = () => {
    navigate(-1);
  };

  const isHost = room?.hostId === myUserId;

  useEffect(() => {
    if (!myUser) return;

    const client = createStompClient(localStorage.getItem("accessToken") || "");

    client.onConnect = () => {
      console.log("STOMP 연결 성공!");
      setStompClient(client); // 👉 onConnect에서만 set!
    };

    client.onStompError = (frame) => {
      console.error("STOMP 에러 발생:", frame);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [myUser]);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        if (!roomId) return;
        const roomData = await fetchRoomById(roomId);
        console.log("방 정보:", roomData);
        setRoom(roomData);
      } catch (error) {
        console.error("방 정보 불러오기 실패:", error);
      }
    };
    loadRoom();
  }, [roomId]);

  if (!room || !stompClient?.connected || !myUser) return <div>로딩 중...</div>;

  return (
    // 전체 레이아웃
    <div className="flex flex-col h-screen bg-gray-900 text-white">
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
        <main className="flex-1 bg-black">
          <VideoPlayer
            videoId={room.playlist[room.currentVideoIndex]}
            isHost={isHost}
            stompClient={stompClient}
            user={myUser!}
            roomId={room.roomId}
          />
        </main>

        {/* 오른쪽: 사이드바 */}
        <aside className="w-80 bg-gray-800 flex flex-col border-l border-gray-700">
          {/* 탭 버튼 */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${
                activeTab === "chat"
                  ? "text-white border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              실시간 채팅
            </button>
            <button
              onClick={() => setActiveTab("playlist")}
              className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${
                activeTab === "playlist"
                  ? "text-white border-b-2 border-purple-500"
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
          />
        </aside>
      </div>
    </div>
  );
};

export default LiveRoomPage;

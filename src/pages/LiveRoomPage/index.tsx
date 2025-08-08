import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRoomById } from "../../api/roomService";
import { useUserStore } from "../../store/useUserStore";
import { Client } from "@stomp/stompjs";
import { createStompClient } from "../../socket";

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
    stompClient?.deactivate();
    navigate(-1);
  };

  const isHost = room?.hostId === myUserId;

  // 방장이 playlist 영상 추가 시 update publish
  const handleAddToPlaylist = (newVideoId: string) => {
    if (!stompClient?.connected || !myUser || !room) return;
    if (!isHost) return;

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
  };

  useEffect(() => {
    if (!myUser) return;

    const client = createStompClient(localStorage.getItem("accessToken") || "");

    client.onConnect = () => {
      console.log("STOMP 연결 성공!");
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
  }, [myUser, roomId]);

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

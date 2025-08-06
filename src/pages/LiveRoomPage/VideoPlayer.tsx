import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { Client } from "@stomp/stompjs";
import type { User } from "../../types";

type VideoPlayerProps = {
  videoId: string;
  isHost: boolean;
  stompClient: Client;
  user: User;
  roomId: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, isHost, stompClient, user, roomId }) => {
  const playerRef = useRef<YT.Player | null>(null);

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
  };

  const onPlayerStateChange = (event: any) => {
    if (!isHost || !playerRef.current || !stompClient.connected) return;

    const currentTime = playerRef.current.getCurrentTime();

    switch (event.data) {
      case 1: // play
        stompClient.publish({
          destination: `/app/room/update`,
          body: JSON.stringify({
            roomId,
            hostId: user.userId,
            type: "play",
            currentTime,
          }),
        });
        break;
      case 2: // pause
        stompClient.publish({
          destination: `/app/room/update`,
          body: JSON.stringify({
            roomId,
            hostId: user.userId,
            type: "pause",
            currentTime,
          }),
        });
        break;
    }
  };

  // 참여자: 서버에서 메시지 수신하여 재생 상태 동기화
  useEffect(() => {
    if (!stompClient.connected || isHost) return;

    const subscription = stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      const { type, currentTime } = JSON.parse(message.body);
      const player = playerRef.current;
      if (!player) return;

      if (type === "play") {
        player.seekTo(currentTime, true);
        player.playVideo();
      } else if (type === "pause") {
        player.seekTo(currentTime, true);
        player.pauseVideo();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient, isHost, roomId]);

  return (
    <div className="w-full h-full">
      {videoId ? (
        <YouTube
          videoId={videoId}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 1,
              controls: 1,
              rel: 0,
            },
          }}
        />
      ) : (
        <div className="text-center text-white mt-10">영상 ID가 없습니다.</div>
      )}
    </div>
  );
};

export default VideoPlayer;

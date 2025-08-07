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

  const playlist = [videoId]
  const currentVideoIndex = 0

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    if (!isHost) event.target.pauseVideo();
  };

  const onPlayerStateChange = (event: any) => {
    if (!stompClient.connected || !playerRef.current) return;
    const player = playerRef.current;
    if (!isHost && event.data === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      return;
    }
    if (!isHost) return;

    const currentTime = player.getCurrentTime();
    const isPlaying = event.data === YT.PlayerState.PLAYING;

    const payload = {
      roomId: parseInt(roomId),
      hostId: user.userId,
      playlist,
      currentVideoIndex,
      currentTime,
      isPlaying,
      lastUpdated: Date.now(),
    };

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });
  };

  useEffect(() => {
    if (!stompClient || !stompClient.connected) return;

    const subscription = stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      if (isHost) return;
      const {
        currentTime,
        isPlaying
      } = JSON.parse(message.body);

      const player = playerRef.current;
      if (!player) return;

      player.seekTo(currentTime, true);
      isPlaying ? player.playVideo() : player.pauseVideo();
    });

    console.log(`Subscribed to /topic/room/${roomId}`);

    return () => {
      subscription.unsubscribe();
      console.log(`Unsubscribed from /topic/room/${roomId}`);
    };
  }, [stompClient, isHost, roomId]);

  return (
    <div className="relative w-full h-full">
      {videoId ? (
        <>
          <YouTube
            videoId={videoId}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: { autoplay: 0, controls: isHost ? 1 : 0, disablekb: 1, rel: 0 },
            }}
          />
          {!isHost && (
            <>
              <div className="absolute inset-0 z-10 bg-transparent cursor-not-allowed" style={{ pointerEvents: "auto" }} />
              <div className="absolute inset-0 z-20 flex items-center justify-center text-white text-lg bg-black/40">
                방장이 영상을 재생할 때까지 대기 중입니다...
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center text-white mt-10">영상 ID가 없습니다.</div>
      )}
    </div>
  );
};

export default VideoPlayer;
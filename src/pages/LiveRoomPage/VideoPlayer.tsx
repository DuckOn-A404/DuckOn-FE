import React, { useEffect, useRef, useState } from "react";
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

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  isHost,
  stompClient,
  user,
  roomId,
}) => {
  const playerRef = useRef<YT.Player | null>(null);
  const [canWatch, setCanWatch] = useState(false);

  const playlist = [videoId];
  const currentVideoIndex = 0;

  const onPlayerReady = (event: YT.PlayerEvent) => {
    playerRef.current = event.target;
    event.target.pauseVideo(); // 방장과 참가자 모두 자동 재생 방지
    event.target.mute();       // autoplay 정책 우회용
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (!stompClient.connected || !playerRef.current) return;

    const player = playerRef.current;

    // 참가자는 직접 재생 시도 불가
    if (!isHost && event.data === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      return;
    }

    if (!isHost) return;

    const currentTime = player.getCurrentTime();
    const playing = event.data === YT.PlayerState.PLAYING;

    const payload = {
      roomId: parseInt(roomId),
      hostId: user.userId,
      playlist,
      currentVideoIndex,
      currentTime,
      playing,
      lastUpdated: Date.now(),
    };

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });
  };

  useEffect(() => {
    if (!stompClient || !stompClient.connected || isHost) return;

    const waitAndSubscribe = () => {
      if (!playerRef.current) {
        setTimeout(waitAndSubscribe, 100);
        return;
      }

      const subscription = stompClient.subscribe(
        `/topic/room/${roomId}`,
        (message) => {
          try {
            const { currentTime, playing } = JSON.parse(message.body);
            const player = playerRef.current;
            if (!player) return;

            player.seekTo(currentTime, true);
            setTimeout(() => {
              if (playing) {
                player.playVideo();
                setCanWatch(true);
              } else {
                player.pauseVideo();
                setCanWatch(false);
              }
            }, 200); // 재생 상태 반영에 약간의 딜레이
          } catch (err) {
            console.error("메시지 파싱 실패", err);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    waitAndSubscribe();
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
              playerVars: {
                autoplay: 0, // ✅ 방장도 자동재생 방지
                mute: 1,
                controls: isHost ? 1 : 0,
                disablekb: 1,
                rel: 0,
              },
            }}
          />
          {!isHost && !canWatch && (
            <>
              <div
                className="absolute inset-0 z-10 bg-transparent cursor-not-allowed"
                style={{ pointerEvents: "auto" }}
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center text-white text-lg bg-black/40">
                방장이 영상을 재생할 때까지 대기 중입니다...
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center text-white mt-10">
          영상 ID가 없습니다.
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

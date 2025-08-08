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

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  isHost,
  stompClient,
  user,
  roomId,
}) => {
  const playerRef = useRef<YT.Player | null>(null);

  const playlist = [videoId];
  const currentVideoIndex = 0;

  const onPlayerReady = (event: YT.PlayerEvent) => {
    playerRef.current = event.target;
    if (!isHost) {
      event.target.pauseVideo(); // 참가자는 처음에 영상 멈춰놓기
      event.target.mute();       // autoplay 제한 회피용 mute
    }
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    console.log("[상태 변경]", event.data);
    console.log("stomp 연결 상태:", stompClient.connected);
    console.log("isHost:", isHost);
    if (!stompClient.connected || !playerRef.current) return;

    const player = playerRef.current;

    // 참가자가 play 버튼을 눌렀을 때 강제 정지
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

    const jsonPayload = JSON.stringify(payload);

    console.log("[STOMP 전송 데이터]", jsonPayload);

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
          console.log("[참가자] 메시지 수신:", message.body);
          try {
            const { currentTime, playing } = JSON.parse(message.body);
            const player = playerRef.current;
            if (!player) return;

            player.seekTo(currentTime, true);

            setTimeout(() => {
              if (playing) {
                player.playVideo();
              } else {
                player.pauseVideo();
              }
            }, 200);
          } catch (err) {
            console.error("메시지 파싱 실패", err);
          }
        }
      );

      console.log(`Subscribed to /topic/room/${roomId}`);

      // 클린업
      return () => {
        subscription.unsubscribe();
        console.log(`Unsubscribed from /topic/room/${roomId}`);
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
                autoplay: 0,               // autoplay 설정
                mute: 1,                   // 브라우저 autoplay 정책 우회
                controls: isHost ? 1 : 0,  // 참가자는 조작 불가
                disablekb: 1,
                rel: 0,
              },
            }}
          />
          {!isHost && (
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

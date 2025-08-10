import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { Client } from "@stomp/stompjs";
import type { User } from "../../types";

type VideoPlayerProps = {
  videoId: string;
  isHost: boolean;
  stompClient: Client;
  user: User;
  roomId: number;
  playlist: string[];
  currentVideoIndex: number;
  isPlaylistUpdating: boolean;
  onVideoEnd: () => void;
};

const DRIFT_TOLERANCE = 0.9;  // 초 단위
const HEARTBEAT_MS = 5000;  // 방장 주기 송신

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  isHost,
  stompClient,
  user,
  roomId,
  playlist,
  currentVideoIndex,
  isPlaylistUpdating,
  onVideoEnd,
}) => {
  const playerRef = useRef<YT.Player | null>(null);
  const [canWatch, setCanWatch] = useState(false);
  // const shouldPlayAfterSeek = useRef(false);
  const justSynced = useRef(false)  // 동기화 직후 onStateChange 오작동 방지

  const onPlayerReady = (event: YT.PlayerEvent) => {
    playerRef.current = event.target;
    event.target.pauseVideo();
    event.target.mute(); // autoplay 우회용
    console.log("[공통] YouTube player 준비됨");
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    // 영상 종료 상태 감지
    if (event.data === YT.PlayerState.ENDED) {
      if (isHost) {
        onVideoEnd();
      }
      return;
    }

    const player = playerRef.current;
    if (!stompClient.connected || !player) return;

    // 참가자: 수동 재생 차단 또는 허용
    if (!isHost) {
      if (event.data === YT.PlayerState.PLAYING) {
        if (justSynced.current) {
          justSynced.current = false
          return
        }
        if (!canWatch) {
          player.pauseVideo()
        }
        // if (!shouldPlayAfterSeek.current) {
        //   console.log("[참가자] 수동 재생 시도 차단");
        //   player.pauseVideo();
        // } else {
        //   console.log("[참가자] 호스트 재생 허용");
        //   setCanWatch(true);
        //   shouldPlayAfterSeek.current = false;
        // }
      }
      return;
    }

    // 방장만 상태 전송
    const currentTime = player.getCurrentTime();
    const playing = event.data === YT.PlayerState.PLAYING;
    
    const payload = {
      roomId,
      hostId: user.userId,
      playlist,
      currentVideoIndex,
      currentTime,
      playing,
      lastUpdated: Date.now(),
    };
    
    console.log("[방장] 상태 변경 발생:", {
      state: event.data,
      playing,
      currentTime,
    });

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });
  };

  // 참가자: 구독 처리
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
            const parsed = JSON.parse(message.body) as {
              currentTime: number;
              playing: boolean;
              lastUpdated?: number;
            }
            const player = playerRef.current;
            if (!player) return;

            const now = Date.now();
            const expectedTime = 
              typeof parsed.lastUpdated === "number"
                ? parsed.currentTime + (now - parsed.lastUpdated) / 1000
                : parsed.currentTime;

            const localTime = player.getCurrentTime();
            const drift = Math.abs(localTime - expectedTime);

            if (parsed.playing) {
              if (!canWatch) {
                // 첫 시작: 강제 동기화 후 재생
                player.seekTo(expectedTime, true);
                player.mute();
                justSynced.current = true;
                player.playVideo();
                setCanWatch(true);
                return
              }
              // 이미 시청 중
              if (drift > DRIFT_TOLERANCE) {
                player.seekTo(expectedTime, true);
                justSynced.current = true;
              }
            } else {
              player.pauseVideo();
              setCanWatch(false);
            }
          } catch (err) {
            console.error("참가자 메시지 파싱 실패", err)
          }
          // try {
          //   const { currentTime, playing } = JSON.parse(message.body);
          //   const player = playerRef.current;
          //   if (!player) return;

          //   console.log("[참가자] 메시지 수신:", {
          //     currentTime,
          //     playing,
          //   });

          //   player.seekTo(currentTime, true);
          //   player.mute();

          //   if (playing) {
          //     shouldPlayAfterSeek.current = true;
          //     player.playVideo();
          //   } else {
          //     shouldPlayAfterSeek.current = false;
          //     player.pauseVideo();
          //     setCanWatch(false);
          //   }
          // } catch (err) {
          //   console.error("[참가자] 메시지 파싱 실패", err);
          // }
        }
      );

      return () => subscription.unsubscribe();
    };

    waitAndSubscribe();
  }, [stompClient, isHost, roomId, canWatch]);

  // 방장: 주기적 상태 송신
  useEffect(() => {
    if (!isHost || !stompClient.connected || isPlaylistUpdating) return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      const payload = {
        roomId,
        hostId: user.userId,
        playlist,
        currentVideoIndex,
        currentTime: player.getCurrentTime(),
        playing: player.getPlayerState() === YT.PlayerState.PLAYING,
        lastUpdated: Date.now(),
      };

      console.log("[방장] 상태 송신:", {
        currentTime: payload.currentTime,
        playing: payload.playing,
      });

      stompClient.publish({
        destination: "/app/room/update",
        body: JSON.stringify(payload),
      });
    }, HEARTBEAT_MS);

    return () => clearInterval(interval);
  }, [
    isHost,
    stompClient,
    isPlaylistUpdating,
    user,
    roomId,
    playlist,
    currentVideoIndex,
  ]);

  return (
    <div
      className="relative w-full h-full rounded-lg border border-gray-800 overflow-hidden bg-black
                flex items-center justify-center"
    >
      {videoId ? (
        <>
          <div className="h-full w-auto aspect-video max-w-full">
            <YouTube
              videoId={videoId}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              className="w-full h-full"
              opts={{
                width: "100%",
                height: "100%",
                playerVars: {
                  autoplay: 0,
                  mute: 1,
                  controls: isHost ? 1 : 0,
                  disablekb: 1,
                  rel: 0,
                  enablejsapi: 1,
                  playsinline: 1,
                },
              }}
            />
          </div>

          {!isHost && !canWatch && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-20 w-full h-full flex items-center justify-center text-white text-lg">
                방장이 영상을 재생할 때까지 대기 중입니다...
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-white mt-10">영상 ID가 없습니다.</div>
      )}
    </div>
  );

};

export default VideoPlayer;

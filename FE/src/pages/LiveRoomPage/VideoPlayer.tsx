// import React, { useEffect, useRef, useState } from "react";
// import YouTube from "react-youtube";
// import { Client } from "@stomp/stompjs";
// import type { User } from "../../types";

// type VideoPlayerProps = {
//   videoId: string;
//   isHost: boolean;
//   stompClient: Client;
//   user: User;
//   roomId: number;
//   playlist: string[];
//   currentVideoIndex: number;
//   isPlaylistUpdating: boolean;
//   onVideoEnd: () => void;
// };

// const DRIFT_TOLERANCE = 0.9;  // 초 단위
// const HEARTBEAT_MS = 5000;  // 방장 주기 송신

// const VideoPlayer: React.FC<VideoPlayerProps> = ({
//   videoId,
//   isHost,
//   stompClient,
//   user,
//   roomId,
//   playlist,
//   currentVideoIndex,
//   isPlaylistUpdating,
//   onVideoEnd,
// }) => {
//   const playerRef = useRef<YT.Player | null>(null);
//   const [canWatch, setCanWatch] = useState(false);
//   const justSynced = useRef(false)  // 동기화 직후 onStateChange 오작동 방지

//   const onPlayerReady = (event: YT.PlayerEvent) => {
//     playerRef.current = event.target;
//     event.target.pauseVideo();
//     event.target.mute(); // autoplay 우회용
//     console.log("[공통] YouTube player 준비됨");
//   };

//   const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
//     // 영상 종료 상태 감지
//     if (event.data === YT.PlayerState.ENDED) {
//       if (isHost) {
//         onVideoEnd();
//       }
//       return;
//     }

//     const player = playerRef.current;
//     if (!stompClient.connected || !player) return;

//     // 참가자: 수동 재생 차단 또는 허용
//     if (!isHost) {
//       if (event.data === YT.PlayerState.PLAYING) {
//         if (justSynced.current) {
//           justSynced.current = false
//           return
//         }
//         if (!canWatch) {
//           player.pauseVideo()
//         }
//       }
//       return;
//     }

//     // 방장만 상태 전송
//     const currentTime = player.getCurrentTime();
//     const playing = event.data === YT.PlayerState.PLAYING;
    
//     const payload = {
//       roomId,
//       hostId: user.userId,
//       playlist,
//       currentVideoIndex,
//       currentTime,
//       playing,
//       lastUpdated: Date.now(),
//     };
    
//     console.log("[방장] 상태 변경 발생:", {
//       state: event.data,
//       playing,
//       currentTime,
//     });

//     stompClient.publish({
//       destination: "/app/room/update",
//       body: JSON.stringify(payload),
//     });
//   };

//   // 참가자: 구독 처리
//   useEffect(() => {
//     if (!stompClient || !stompClient.connected || isHost) return;

//     const waitAndSubscribe = () => {
//       if (!playerRef.current) {
//         setTimeout(waitAndSubscribe, 100);
//         return;
//       }

//       const subscription = stompClient.subscribe(
//         `/topic/room/${roomId}`,
//         (message) => {
//           try {
//             const parsed = JSON.parse(message.body) as {
//               currentTime: number;
//               playing: boolean;
//               lastUpdated?: number;
//             }
//             const player = playerRef.current;
//             if (!player) return;

//             const now = Date.now();
//             const expectedTime = 
//               typeof parsed.lastUpdated === "number"
//                 ? parsed.currentTime + (now - parsed.lastUpdated) / 1000
//                 : parsed.currentTime;

//             const localTime = player.getCurrentTime();
//             const drift = Math.abs(localTime - expectedTime);

//             if (parsed.playing) {
//               if (!canWatch) {
//                 // 첫 시작: 강제 동기화 후 재생
//                 player.seekTo(expectedTime, true);
//                 player.mute();
//                 justSynced.current = true;
//                 player.playVideo();
//                 setCanWatch(true);
//                 return
//               }
//               // 이미 시청 중
//               if (drift > DRIFT_TOLERANCE) {
//                 player.seekTo(expectedTime, true);
//                 justSynced.current = true;
//               }
//             } else {
//               player.pauseVideo();
//               setCanWatch(false);
//             }
//           } catch (err) {
//             console.error("참가자 메시지 파싱 실패", err)
//           }
//         }
//       );

//       return () => subscription.unsubscribe();
//     };

//     waitAndSubscribe();
//   }, [stompClient, isHost, roomId, canWatch]);

//   // 방장: 주기적 상태 송신
//   useEffect(() => {
//     if (!isHost || !stompClient.connected || isPlaylistUpdating) return;

//     const interval = setInterval(() => {
//       const player = playerRef.current;
//       if (!player) return;

//       const payload = {
//         roomId,
//         hostId: user.userId,
//         playlist,
//         currentVideoIndex,
//         currentTime: player.getCurrentTime(),
//         playing: player.getPlayerState() === YT.PlayerState.PLAYING,
//         lastUpdated: Date.now(),
//       };

//       console.log("[방장] 상태 송신:", {
//         currentTime: payload.currentTime,
//         playing: payload.playing,
//       });

//       stompClient.publish({
//         destination: "/app/room/update",
//         body: JSON.stringify(payload),
//       });
//     }, HEARTBEAT_MS);

//     return () => clearInterval(interval);
//   }, [
//     isHost,
//     stompClient,
//     isPlaylistUpdating,
//     user,
//     roomId,
//     playlist,
//     currentVideoIndex,
//   ]);

//   return (
//     <div
//       className="relative w-full h-full rounded-lg border border-gray-800 overflow-hidden bg-black
//                 flex items-center justify-center"
//     >
//       {videoId ? (
//         <>
//           <div className="h-full w-auto aspect-video max-w-full">
//             <YouTube
//               videoId={videoId}
//               onReady={onPlayerReady}
//               onStateChange={onPlayerStateChange}
//               className="w-full h-full"
//               opts={{
//                 width: "100%",
//                 height: "100%",
//                 playerVars: {
//                   autoplay: 0,
//                   mute: 1,
//                   controls: isHost ? 1 : 0,
//                   disablekb: 1,
//                   rel: 0,
//                   enablejsapi: 1,
//                   playsinline: 1,
//                 },
//               }}
//             />
//           </div>

//           {!isHost && !canWatch && (
//             <div className="absolute inset-0 z-10 pointer-events-auto">
//               <div className="absolute inset-0 bg-black/40" />
//               <div className="relative z-20 w-full h-full flex items-center justify-center text-white text-lg">
//                 방장이 영상을 재생할 때까지 대기 중입니다...
//               </div>
//             </div>
//           )}
//         </>
//       ) : (
//         <div className="text-center text-white mt-10">영상 ID가 없습니다.</div>
//       )}
//     </div>
//   );

// };

// export default VideoPlayer;


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

const DRIFT_TOLERANCE_HARD = 2.5;  // 이 이상 어긋나면 seekTo
const DRIFT_TOLERANCE_SOFT = 0.4;  // 이 이상이면 잠깐 배속 보정
const HEARTBEAT_MS = 5000;         // 방장 주기 송신 간격(ms)
const SOFT_CORRECT_MS = 1500;      // 소프트 보정 유지 시간(ms)

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

  // 동기화 직후 onStateChange 오작동 방지
  const justSynced = useRef(false);

  // 소리 제어
  const [muted, setMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);

  // 소프트 보정 타이머
  const rateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRateTimer = () => {
    if (rateTimerRef.current) {
      clearTimeout(rateTimerRef.current);
      rateTimerRef.current = null;
    }
  };

  const restoreNormalRate = () => {
    const p = playerRef.current;
    if (!p) return;
    // 가능한 경우만 1.0으로 복귀
    if (typeof p.setPlaybackRate === "function" && p.getPlaybackRate() !== 1) {
      try {
        p.setPlaybackRate(1);
      } catch {}
    }
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    playerRef.current = event.target;
    event.target.pauseVideo();
    event.target.mute();        // 자동재생 정책 회피
    event.target.setVolume?.(100);
    console.log("[공통] YouTube player 준비됨");
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    // 영상 종료
    if (event.data === YT.PlayerState.ENDED) {
      if (isHost) onVideoEnd();
      return;
    }

    const player = playerRef.current;
    if (!stompClient.connected || !player) return;

    // === 참가자 측 ===
    if (!isHost) {
      // 참가자가 임의로 일시정지한 경우 즉시 복귀 (정지 금지)
      if (event.data === YT.PlayerState.PAUSED && canWatch) {
        try { player.playVideo(); } catch {}
        return;
      }

      // 수동 재생 시도: 허용 전에 play되면 멈춤
      if (event.data === YT.PlayerState.PLAYING) {
        if (justSynced.current) {
          justSynced.current = false;
          return;
        }
        if (!canWatch) {
          player.pauseVideo();
        }
      }
      return;
    }

    // === 방장 측: 상태 변경 시 즉시 브로드캐스트 ===
    const payload = {
      roomId,
      hostId: user.userId,
      playlist,
      currentVideoIndex,
      currentTime: player.getCurrentTime(),
      playing: event.data === YT.PlayerState.PLAYING,
      lastUpdated: Date.now(),
    };

    stompClient.publish({
      destination: "/app/room/update",
      body: JSON.stringify(payload),
    });
  };

  // 참가자: 구독 처리 + 드리프트 기반 보정(소프트/하드)
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
            };

            const player = playerRef.current;
            if (!player) return;

            const now = Date.now();
            const expectedTime =
              typeof parsed.lastUpdated === "number"
                ? parsed.currentTime + (now - parsed.lastUpdated) / 1000
                : parsed.currentTime;

            const localTime = player.getCurrentTime();
            const delta = expectedTime - localTime;
            const absDrift = Math.abs(delta);

            if (parsed.playing) {
              // 첫 시작: 강제 동기화 후 재생
              if (!canWatch) {
                clearRateTimer();
                restoreNormalRate();
                player.seekTo(expectedTime, true);
                player.mute(); // 초기엔 항상 mute
                justSynced.current = true;
                player.playVideo();
                setCanWatch(true);
                setShowUnmuteHint(true); // 시청 시작되면 "사운드 켜기" 안내 노출
                return;
              }

              // 이미 시청 중
              if (absDrift >= DRIFT_TOLERANCE_HARD) {
                // 하드 보정: seek
                clearRateTimer();
                restoreNormalRate();
                player.seekTo(expectedTime, true);
                justSynced.current = true;
              } else if (absDrift >= DRIFT_TOLERANCE_SOFT) {
                // 소프트 보정: 짧은 배속으로 따라잡기
                // YouTube는 고정 배속만 허용(0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2)
                const targetRate = delta > 0 ? 1.25 : 0.75;
                try {
                  if (player.getPlaybackRate() !== targetRate) {
                    player.setPlaybackRate(targetRate);
                  }
                } catch {}
                clearRateTimer();
                rateTimerRef.current = setTimeout(() => {
                  restoreNormalRate();
                }, SOFT_CORRECT_MS);
              } else {
                // 아주 작은 드리프트: 아무 것도 안함
                // 혹시 남아있을 수 있는 배속 복귀
                clearRateTimer();
                restoreNormalRate();
              }
            } else {
              // 호스트가 멈춘 경우: 참가자도 멈춤
              clearRateTimer();
              restoreNormalRate();
              player.pauseVideo();
              setCanWatch(false);
            }
          } catch (err) {
            console.error("참가자 메시지 파싱 실패", err);
          }
        }
      );

      return () => subscription.unsubscribe();
    };

    waitAndSubscribe();

    // cleanup 시 배속 원복
    return () => {
      clearRateTimer();
      restoreNormalRate();
    };
  }, [stompClient, isHost, roomId, canWatch]);

  // 방장: 주기적 상태 송신(하트비트). 플레이리스트 갱신 중엔 중단.
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

  // 참가자: 사운드 켜기 버튼
  const handleUnmute = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.unMute();
      p.setVolume?.(100);
      setMuted(false);
      setShowUnmuteHint(false);
      // 사용자의 명시적 제스처이므로 정책에 걸리지 않음
    } catch (e) {
      console.warn("unMute 실패", e);
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg border border-gray-800 overflow-hidden bg-black flex items-center justify-center">
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
                  mute: 1,                 // 초기 mute (런타임에 unMute)
                  controls: isHost ? 1 : 0, // 참가자 조작 불가
                  disablekb: 1,            // 키보드 조작 차단
                  rel: 0,
                  enablejsapi: 1,
                  playsinline: 1,
                },
              }}
            />
          </div>

          {/* 참가자: 호스트 play 전 대기 오버레이 */}
          {!isHost && !canWatch && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-20 w-full h-full flex items-center justify-center text-white text-lg">
                방장이 영상을 재생할 때까지 대기 중입니다...
              </div>
            </div>
          )}

          {/* 참가자: 사운드 켜기 안내 (재생 시작 후 최초 1회) */}
          {!isHost && canWatch && showUnmuteHint && muted && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={handleUnmute}
                className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm rounded-lg shadow-lg"
              >
                사운드 켜기
              </button>
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

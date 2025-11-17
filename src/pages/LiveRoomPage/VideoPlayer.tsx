// import React, { useEffect, useRef, useState } from "react";
// import YouTube from "react-youtube";
// import { Client } from "@stomp/stompjs";
// import { Capacitor } from "@capacitor/core";
// import type { User } from "../../types";
// import type { LiveRoomSyncDTO } from "../../types/room";

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
//   roomTitle: string;
//   hostNickname?: string | null;
// };

// // 드리프트 보정 파라미터
// const isNativeApp = Capacitor.isNativePlatform();

// const DRIFT_TOLERANCE_HARD = 2.5;
// const DRIFT_TOLERANCE_SOFT = isNativeApp ? 0.2 : 0.4;
// const SOFT_CORRECT_MS = 1500;
// const HEARTBEAT_MS = isNativeApp ? 3000 : 5000;

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
//   roomTitle,
//   hostNickname,
// }) => {
//   const playerRef = useRef<YT.Player | null>(null);

//   // 이 탭(session)에서 이미 '사운드 켜기'를 눌렀는지 여부 (탭 닫힐 때까지 유지)
//   const initialUnlocked = (() => {
//     try {
//       return sessionStorage.getItem("audioUnlocked") === "1";
//     } catch {
//       return false;
//     }
//   })();
//   const audioUnlockedRef = useRef<boolean>(initialUnlocked);

//   // 시청 관련 상태
//   const [canWatch, setCanWatch] = useState(false); // 참가자 재생 허용(재생 중) 여부
//   const justSynced = useRef(false); // sync 직후 onStateChange 가드

//   // 언락되어 있으면 시작부터 비뮤트
//   const [muted, setMuted] = useState<boolean>(!audioUnlockedRef.current);
//   const [showUnmuteHint, setShowUnmuteHint] = useState(false); // "사운드 켜기" 안내 버튼

//   // 소프트 보정 타이머
//   const rateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const clearRateTimer = () => {
//     if (rateTimerRef.current) {
//       clearTimeout(rateTimerRef.current);
//       rateTimerRef.current = null;
//     }
//   };
//   const restoreNormalRate = () => {
//     const p = playerRef.current;
//     if (!p) return;
//     try {
//       if (typeof p.getPlaybackRate === "function" && p.getPlaybackRate() !== 1) {
//         p.setPlaybackRate(1);
//       }
//     } catch {}
//   };

//   // ENDED 중복 호출 방지
//   const endFiredRef = useRef(false);

//   const onPlayerReady = async (event: YT.PlayerEvent) => {
//     const p = event.target;
//     playerRef.current = p;

//     try {
//       if (isHost) {
//         // 방장: 소리 ON 자동재생 시도, 거부 시 아래 catch로 폴백
//         p.unMute?.();
//         p.setVolume?.(100);
//         setMuted(false);
//         await p.playVideo();
//         setCanWatch(true);
//       } else {
//         // 참가자
//         if (audioUnlockedRef.current) {
//           // 이미 언락된 참가자는 다시는 mute로 돌리지 않음
//           p.unMute?.();
//           p.setVolume?.(100);
//           setMuted(false);
//           await p.playVideo();
//           setCanWatch(true);
//         } else {
//           // 아직 언락 전이면 정책상 mute 시작
//           p.mute?.();
//           p.setVolume?.(100);
//           setMuted(true);
//           p.pauseVideo();
//         }
//       }
//     } catch {
//       // 자동재생 거부 → mute 재생으로 폴백
//       try {
//         p.mute?.();
//         setMuted(!audioUnlockedRef.current);
//         await p.playVideo();
//         setCanWatch(true);
//       } catch {
//         p.pauseVideo();
//         setCanWatch(false);
//       }
//     }
//   };

//   const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
//     if (event.data === YT.PlayerState.ENDED) {
//       if (!isHost) return;
//       if (endFiredRef.current) return;
//       endFiredRef.current = true;
//       onVideoEnd();
//       return;
//     }

//     if (event.data === YT.PlayerState.PLAYING) {
//       endFiredRef.current = false; // 다음 종료 감지 준비
//     }

//     const player = playerRef.current;
//     if (!stompClient.connected || !player) return;

//     // 참가자: 임의 조작 차단(호스트만 컨트롤)
//     if (!isHost) {
//       if (event.data === YT.PlayerState.PAUSED && canWatch) {
//         try {
//           player.playVideo();
//         } catch {}
//         return;
//       }
//       if (event.data === YT.PlayerState.PLAYING) {
//         if (justSynced.current) {
//           justSynced.current = false;
//           return;
//         }
//         if (!canWatch) player.pauseVideo();
//       }
//       return;
//     }

//     // 방장: 상태 브로드캐스트
//     const payload: LiveRoomSyncDTO = {
//       eventType: "SYNC_STATE",
//       roomId,
//       hostId: user.userId,
//       title: roomTitle,
//       hostNickname: hostNickname ?? user.nickname ?? "",
//       playlist,
//       currentVideoIndex,
//       currentTime: player.getCurrentTime(),
//       playing: event.data === YT.PlayerState.PLAYING,
//       lastUpdated: Date.now(),
//     };

//     stompClient.publish({
//       destination: "/app/room/update",
//       body: JSON.stringify(payload),
//     });
//   };

//   // 참가자: SYNC_STATE 구독 및 드리프트 보정
//   useEffect(() => {
//     if (!stompClient || !stompClient.connected || isHost) return;

//     const waitAndSubscribe = () => {
//       if (!playerRef.current) {
//         setTimeout(waitAndSubscribe, 100);
//         return;
//       }

//       // requestAnimationFrame으로 부드러운 드리프트 체크 (앱 전용)
//       let animationFrameId: number | null = null;
//       let lastCheckTime = 0;
//       const CHECK_INTERVAL = 300;

//       const continuousDriftCheck = (timestamp: number) => {
//         if (timestamp - lastCheckTime > CHECK_INTERVAL) {
//           lastCheckTime = timestamp;
          
//           const player = playerRef.current;
//           if (player && canWatch) {
//             try {
//               player.getCurrentTime();
//             } catch {}
//           }
//         }
        
//         animationFrameId = requestAnimationFrame(continuousDriftCheck);
//       };

//       if (isNativeApp) {
//         animationFrameId = requestAnimationFrame(continuousDriftCheck);
//       }

//       const subscription = stompClient.subscribe(
//         `/topic/room/${roomId}`,
//         (message) => {
//           try {
//             const parsed = JSON.parse(message.body) as LiveRoomSyncDTO;
//             if (parsed.eventType !== "SYNC_STATE") return;

//             const player = playerRef.current;
//             if (!player) return;

//             const now = Date.now();
//             const expectedTime =
//               typeof parsed.lastUpdated === "number"
//                 ? (parsed.currentTime ?? 0) + (now - parsed.lastUpdated) / 1000
//                 : parsed.currentTime ?? 0;

//             // 재생 안내 버튼 (언락 전일 때만 노출)
//             if (parsed.playing && muted) setShowUnmuteHint(true);

//             const localTime = player.getCurrentTime();
//             const delta = expectedTime - localTime;
//             const absDrift = Math.abs(delta);

//             if (parsed.playing) {
//               if (!canWatch) {
//                 clearRateTimer();
//                 restoreNormalRate();
//                 player.seekTo(expectedTime, true);
//                 justSynced.current = true;
//                 player.playVideo(); // mute 상태면 자동재생 허용
//                 setCanWatch(true);
//                 return;
//               }

//               if (absDrift >= DRIFT_TOLERANCE_HARD) {
//                 clearRateTimer();
//                 restoreNormalRate();
//                 player.seekTo(expectedTime, true);
//                 justSynced.current = true;
//               } else if (absDrift >= DRIFT_TOLERANCE_SOFT) {
//                 const targetRate = delta > 0 ? 1.25 : 0.75;
//                 try {
//                   if (player.getPlaybackRate() !== targetRate) {
//                     player.setPlaybackRate(targetRate);
//                   }
//                 } catch {}
//                 clearRateTimer();
//                 rateTimerRef.current = setTimeout(() => {
//                   restoreNormalRate();
//                 }, SOFT_CORRECT_MS);
//               } else {
//                 clearRateTimer();
//                 restoreNormalRate();
//               }
//             } else {
//               clearRateTimer();
//               restoreNormalRate();
//               player.pauseVideo();
//               setCanWatch(false);
//             }
//           } catch (err) {
//             console.error("참가자 메시지 파싱 실패", err);
//           }
//         }
//       );

//       return () => {
//         subscription.unsubscribe();
//         if (animationFrameId !== null) {
//           cancelAnimationFrame(animationFrameId);
//         }
//       };
//     };

//     const cleanup = waitAndSubscribe();
//     return () => {
//       if (typeof cleanup === "function") cleanup();
//       clearRateTimer();
//       restoreNormalRate();
//     };
//   }, [stompClient, isHost, roomId, canWatch, muted]);

//   // 방장: 하트비트
//   useEffect(() => {
//     if (!isHost || !stompClient.connected || isPlaylistUpdating) return;

//     const interval = setInterval(() => {
//       const player = playerRef.current;
//       if (!player) return;

//       const payload: LiveRoomSyncDTO = {
//         eventType: "SYNC_STATE",
//         roomId,
//         hostId: user.userId,
//         title: roomTitle,
//         hostNickname: hostNickname ?? user.nickname ?? "",
//         playlist,
//         currentVideoIndex,
//         currentTime: player.getCurrentTime(),
//         playing: player.getPlayerState() === YT.PlayerState.PLAYING,
//         lastUpdated: Date.now(),
//       };

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
//     roomTitle,
//     hostNickname,
//   ]);

//   // 같은 videoId가 연속으로 와도 강제 로드하여 자동 넘김 이슈 해결
//   const prevIndexRef = useRef<number>(currentVideoIndex);
//   const prevVideoIdRef = useRef<string>(videoId);
//   useEffect(() => {
//     const p = playerRef.current;
//     if (!p) return;

//     const videoChanged = prevVideoIdRef.current !== videoId;
//     const indexChanged = prevIndexRef.current !== currentVideoIndex;

//     if (videoChanged || indexChanged) {
//       try {
//         // 항상 초기화 후 새로 로드
//         p.stopVideo?.();
//         p.loadVideoById({ videoId, startSeconds: 0 });
//         if (isHost) {
//           p.playVideo?.();
//         }
//       } catch (e) {
//         console.warn("loadVideoById 실패", e);
//       }

//       prevVideoIdRef.current = videoId;
//       prevIndexRef.current = currentVideoIndex;
//     }
//   }, [videoId, currentVideoIndex, isHost]);

//   // 참가자: "사운드 켜기"
//   const handleUnmute = () => {
//     const p = playerRef.current;
//     if (!p) return;
//     try {
//       p.unMute();
//       p.setVolume?.(100);
//       setMuted(false);
//       setShowUnmuteHint(false);
//       // 이 탭에서 이후로는 계속 소리 ON 유지
//       audioUnlockedRef.current = true;
//       sessionStorage.setItem("audioUnlocked", "1");
//     } catch (e) {
//       console.warn("unMute 실패", e);
//     }
//   };

//   // 이미 언락된 참가자는 처음부터 비뮤트로 시작
//   const initialMute = isHost ? 0 : (audioUnlockedRef.current ? 0 : 1);

//   return (
//     <div className="relative w-full h-full bg-black">
//       {videoId ? (
//         <>
//           <YouTube
//             key={`${videoId}-${currentVideoIndex}`}
//             videoId={videoId}
//             onReady={onPlayerReady}
//             onStateChange={onPlayerStateChange}
//             className="w-full h-full"
//             opts={{
//               width: "100%",
//               height: "100%",
//               playerVars: {
//                 autoplay: isHost ? 1 : 0,
//                 mute: initialMute,
//                 controls: isHost ? 1 : 0,
//                 disablekb: 1,
//                 rel: 0,
//                 enablejsapi: 1,
//                 playsinline: 1,
//                 modestbranding: 1,
//                 iv_load_policy: 3,
//               },
//             }}
//           />

//           {/* 참가자: 호스트 재생 중 + 음소거 상태면 "사운드 켜기" 버튼 */}
//           {!isHost && canWatch && showUnmuteHint && muted && (
//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
//               <button
//                 onClick={handleUnmute}
//                 className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm rounded-lg shadow-lg"
//               >
//                 사운드 켜기
//               </button>
//             </div>
//           )}

//           {/* 참가자: 호스트 play 전 대기 오버레이 */}
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

// import React, { useEffect, useRef, useState } from "react";
// import YouTube from "react-youtube";
// import { Client } from "@stomp/stompjs";
// import { Capacitor } from "@capacitor/core";
// import { ScreenOrientation } from "@capacitor/screen-orientation"; // 앱 회전 제어
// import type { User } from "../../types";
// import type { LiveRoomSyncDTO } from "../../types/room";

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
//   roomTitle: string;
//   hostNickname?: string | null;
// };

// // 드리프트 보정 파라미터
// const isNativeApp = Capacitor.isNativePlatform();

// const DRIFT_TOLERANCE_HARD = 2.5;
// const DRIFT_TOLERANCE_SOFT = isNativeApp ? 0.2 : 0.4;
// const SOFT_CORRECT_MS = 1500;
// const HEARTBEAT_MS = isNativeApp ? 3000 : 5000;

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
//   roomTitle,
//   hostNickname,
// }) => {
//   const playerRef = useRef<YT.Player | null>(null);

//   // 🔁 앱 회전 상태 (세로 / 가로)
//   const [orientation, setOrientation] = useState<"portrait" | "landscape">(
//     "portrait"
//   );

//   // 🔁 앱에서만 현재 orientation 동기화
//   useEffect(() => {
//     if (!isNativeApp) return;

//     const init = async () => {
//       try {
//         const info = await ScreenOrientation.orientation();
//         const isLand = info.type.startsWith("landscape");
//         setOrientation(isLand ? "landscape" : "portrait");
//       } catch {
//         // 무시
//       }
//     };

//     init();

//     const sub = ScreenOrientation.addListener(
//       "screenOrientationChange",
//       (ev) => {
//         const isLand = ev.type.startsWith("landscape");
//         setOrientation(isLand ? "landscape" : "portrait");
//       }
//     );

//     return () => {
//       sub.then((s) => s.remove()).catch(() => {});
//     };
//   }, []);

//   // 🔁 회전 토글 버튼 핸들러 (세로 <-> 가로)
//   const handleOrientationToggle = async () => {
//     if (!isNativeApp) return;

//     try {
//       if (orientation === "portrait") {
//         await ScreenOrientation.lock({ orientation: "landscape" });
//         setOrientation("landscape");
//       } else {
//         await ScreenOrientation.lock({ orientation: "portrait" });
//         setOrientation("portrait");
//       }
//     } catch (e) {
//       console.warn("회전 잠금 실패", e);
//     }
//   };

//   // =================== 기존 동작 로직 ===================

//   const initialUnlocked = (() => {
//     try {
//       return sessionStorage.getItem("audioUnlocked") === "1";
//     } catch {
//       return false;
//     }
//   })();
//   const audioUnlockedRef = useRef<boolean>(initialUnlocked);

//   const [canWatch, setCanWatch] = useState(false);
//   const justSynced = useRef(false);

//   const [muted, setMuted] = useState<boolean>(!audioUnlockedRef.current);
//   const [showUnmuteHint, setShowUnmuteHint] = useState(false);

//   const rateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const clearRateTimer = () => {
//     if (rateTimerRef.current) {
//       clearTimeout(rateTimerRef.current);
//       rateTimerRef.current = null;
//     }
//   };
//   const restoreNormalRate = () => {
//     const p = playerRef.current;
//     if (!p) return;
//     try {
//       if (p.getPlaybackRate() !== 1) {
//         p.setPlaybackRate(1);
//       }
//     } catch {}
//   };

//   const endFiredRef = useRef(false);

//   const onPlayerReady = async (event: YT.PlayerEvent) => {
//     const p = event.target;
//     playerRef.current = p;

//     try {
//       if (isHost) {
//         p.unMute?.();
//         p.setVolume?.(100);
//         setMuted(false);
//         await p.playVideo();
//         setCanWatch(true);
//       } else {
//         if (audioUnlockedRef.current) {
//           p.unMute?.();
//           p.setVolume?.(100);
//           setMuted(false);
//           await p.playVideo();
//           setCanWatch(true);
//         } else {
//           p.mute?.();
//           p.setVolume?.(100);
//           setMuted(true);
//           p.pauseVideo();
//         }
//       }
//     } catch {
//       try {
//         p.mute?.();
//         setMuted(!audioUnlockedRef.current);
//         await p.playVideo();
//         setCanWatch(true);
//       } catch {
//         p.pauseVideo();
//         setCanWatch(false);
//       }
//     }
//   };

//   const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
//     if (event.data === YT.PlayerState.ENDED) {
//       if (!isHost) return;
//       if (endFiredRef.current) return;
//       endFiredRef.current = true;
//       onVideoEnd();
//       return;
//     }

//     if (event.data === YT.PlayerState.PLAYING) {
//       endFiredRef.current = false;
//     }

//     const player = playerRef.current;
//     if (!stompClient.connected || !player) return;

//     if (!isHost) {
//       if (event.data === YT.PlayerState.PAUSED && canWatch) {
//         try {
//           player.playVideo();
//         } catch {}
//         return;
//       }
//       if (event.data === YT.PlayerState.PLAYING) {
//         if (justSynced.current) {
//           justSynced.current = false;
//           return;
//         }
//         if (!canWatch) player.pauseVideo();
//       }
//       return;
//     }

//     const payload: LiveRoomSyncDTO = {
//       eventType: "SYNC_STATE",
//       roomId,
//       hostId: user.userId,
//       title: roomTitle,
//       hostNickname: hostNickname ?? user.nickname ?? "",
//       playlist,
//       currentVideoIndex,
//       currentTime: player.getCurrentTime(),
//       playing: event.data === YT.PlayerState.PLAYING,
//       lastUpdated: Date.now(),
//     };

//     stompClient.publish({
//       destination: "/app/room/update",
//       body: JSON.stringify(payload),
//     });
//   };

//   useEffect(() => {
//     if (!stompClient || !stompClient.connected || isHost) return;

//     const waitAndSubscribe = () => {
//       if (!playerRef.current) {
//         setTimeout(waitAndSubscribe, 100);
//         return;
//       }

//       let animationFrameId: number | null = null;
//       let lastCheckTime = 0;
//       const CHECK_INTERVAL = 300;

//       const continuousDriftCheck = (timestamp: number) => {
//         if (timestamp - lastCheckTime > CHECK_INTERVAL) {
//           lastCheckTime = timestamp;
//           const player = playerRef.current;
//           if (player && canWatch) {
//             try {
//               player.getCurrentTime();
//             } catch {}
//           }
//         }
//         animationFrameId = requestAnimationFrame(continuousDriftCheck);
//       };

//       if (isNativeApp) {
//         animationFrameId = requestAnimationFrame(continuousDriftCheck);
//       }

//       const subscription = stompClient.subscribe(
//         `/topic/room/${roomId}`,
//         (message) => {
//           try {
//             const parsed = JSON.parse(message.body) as LiveRoomSyncDTO;
//             if (parsed.eventType !== "SYNC_STATE") return;

//             const player = playerRef.current;
//             if (!player) return;

//             const now = Date.now();
//             const expectedTime =
//               typeof parsed.lastUpdated === "number"
//                 ? (parsed.currentTime ?? 0) +
//                   (now - parsed.lastUpdated) / 1000
//                 : parsed.currentTime ?? 0;

//             if (parsed.playing && muted) setShowUnmuteHint(true);

//             const localTime = player.getCurrentTime();
//             const delta = expectedTime - localTime;
//             const absDrift = Math.abs(delta);

//             if (parsed.playing) {
//               if (!canWatch) {
//                 clearRateTimer();
//                 restoreNormalRate();
//                 player.seekTo(expectedTime, true);
//                 justSynced.current = true;
//                 player.playVideo();
//                 setCanWatch(true);
//                 return;
//               }

//               if (absDrift >= DRIFT_TOLERANCE_HARD) {
//                 clearRateTimer();
//                 restoreNormalRate();
//                 player.seekTo(expectedTime, true);
//                 justSynced.current = true;
//               } else if (absDrift >= DRIFT_TOLERANCE_SOFT) {
//                 const targetRate = delta > 0 ? 1.25 : 0.75;
//                 try {
//                   if (player.getPlaybackRate() !== targetRate) {
//                     player.setPlaybackRate(targetRate);
//                   }
//                 } catch {}
//                 clearRateTimer();
//                 rateTimerRef.current = setTimeout(() => {
//                   restoreNormalRate();
//                 }, SOFT_CORRECT_MS);
//               } else {
//                 clearRateTimer();
//                 restoreNormalRate();
//               }
//             } else {
//               clearRateTimer();
//               restoreNormalRate();
//               player.pauseVideo();
//               setCanWatch(false);
//             }
//           } catch (err) {
//             console.error("참가자 메시지 파싱 실패", err);
//           }
//         }
//       );

//       return () => {
//         subscription.unsubscribe();
//         if (animationFrameId !== null) {
//           cancelAnimationFrame(animationFrameId);
//         }
//       };
//     };

//     const cleanup = waitAndSubscribe();
//     return () => {
//       if (typeof cleanup === "function") cleanup();
//       clearRateTimer();
//       restoreNormalRate();
//     };
//   }, [stompClient, isHost, roomId, canWatch, muted]);

//   useEffect(() => {
//     if (!isHost || !stompClient.connected || isPlaylistUpdating) return;

//     const interval = setInterval(() => {
//       const player = playerRef.current;
//       if (!player) return;

//       const payload: LiveRoomSyncDTO = {
//         eventType: "SYNC_STATE",
//         roomId,
//         hostId: user.userId,
//         title: roomTitle,
//         hostNickname: hostNickname ?? user.nickname ?? "",
//         playlist,
//         currentVideoIndex,
//         currentTime: player.getCurrentTime(),
//         playing:
//           player.getPlayerState() === YT.PlayerState.PLAYING,
//         lastUpdated: Date.now(),
//       };

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
//     roomTitle,
//     hostNickname,
//   ]);

//   const prevIndexRef = useRef<number>(currentVideoIndex);
//   const prevVideoIdRef = useRef<string>(videoId);
//   useEffect(() => {
//     const p = playerRef.current;
//     if (!p) return;

//     const videoChanged = prevVideoIdRef.current !== videoId;
//     const indexChanged = prevIndexRef.current !== currentVideoIndex;

//     if (videoChanged || indexChanged) {
//       try {
//         p.stopVideo?.();
//         p.loadVideoById({
//           videoId,
//           startSeconds: 0,
//         });
//         if (isHost) {
//           p.playVideo?.();
//         }
//       } catch (e) {
//         console.warn("loadVideoById 실패", e);
//       }

//       prevVideoIdRef.current = videoId;
//       prevIndexRef.current = currentVideoIndex;
//     }
//   }, [videoId, currentVideoIndex, isHost]);

//   const handleUnmute = () => {
//     const p = playerRef.current;
//     if (!p) return;
//     try {
//       p.unMute();
//       p.setVolume?.(100);
//       setMuted(false);
//       setShowUnmuteHint(false);
//       audioUnlockedRef.current = true;
//       sessionStorage.setItem("audioUnlocked", "1");
//     } catch (e) {
//       console.warn("unMute 실패", e);
//     }
//   };

//   const initialMute = isHost ? 0 : (audioUnlockedRef.current ? 0 : 1);

//   // =================== 렌더링 ===================
//   return (
//     <div className="relative w-full h-full bg-black">
//       {videoId ? (
//         <>
//           <YouTube
//             key={`${videoId}-${currentVideoIndex}`}
//             videoId={videoId}
//             onReady={onPlayerReady}
//             onStateChange={onPlayerStateChange}
//             className="w-full h-full"
//             opts={{
//               width: "100%",
//               height: "100%",
//               playerVars: {
//                 autoplay: isHost ? 1 : 0,
//                 mute: initialMute,
//                 controls: isHost ? 1 : 0,
//                 disablekb: 1,
//                 rel: 0,
//                 enablejsapi: 1,
//                 playsinline: 1,
//                 modestbranding: 1,
//                 iv_load_policy: 3,
//               },
//             }}
//           />

//           {/* 참가자: 호스트 재생 중 + 음소거 상태면 "사운드 켜기" 버튼 */}
//           {!isHost && canWatch && showUnmuteHint && muted && (
//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
//               <button
//                 onClick={handleUnmute}
//                 className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm rounded-lg shadow-lg"
//               >
//                 사운드 켜기
//               </button>
//             </div>
//           )}

//           {/* 참가자: 호스트 play 전 대기 오버레이 */}
//           {!isHost && !canWatch && (
//             <div className="absolute inset-0 z-10 pointer-events-auto">
//               <div className="absolute inset-0 bg-black/40" />
//               <div className="relative z-20 w-full h-full flex items-center justify-center text-white text-lg">
//                 방장이 영상을 재생할 때까지 대기 중입니다...
//               </div>
//             </div>
//           )}

//           {/* 🔁 soop 스타일 회전 버튼 (앱에서만 표시) */}
//           {isNativeApp && (
//             <button
//               type="button"
//               onClick={handleOrientationToggle}
//               className="
//                 absolute bottom-4 right-4 z-30
//                 active:scale-95 transition-transform
//               "
//             >
//               <div
//                 className="
//                   w-10 h-10 rounded-full
//                   bg-white/95
//                   shadow-[0_4px_12px_rgba(0,0,0,0.35)]
//                   border border-black/5
//                   flex items-center justify-center
//                 "
//               >
//                 {/* 회전 아이콘 (폰 + 회전 화살표 느낌) */}
//                 <svg
//                   viewBox="0 0 24 24"
//                   className="w-5 h-5 text-gray-900"
//                   aria-hidden="true"
//                 >
//                   {/* 폰 모양 */}
//                   <rect
//                     x="8"
//                     y="5"
//                     width="8"
//                     height="14"
//                     rx="2"
//                     ry="2"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.6"
//                   />
//                   {/* 위쪽 작은 홈 (스피커) */}
//                   <rect
//                     x="10.5"
//                     y="6.3"
//                     width="3"
//                     height="0.9"
//                     rx="0.45"
//                     fill="currentColor"
//                   />
//                   {/* 회전 화살표 */}
//                   <path
//                     d="M6 10a6 6 0 0 1 6-6"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.6"
//                     strokeLinecap="round"
//                   />
//                   <path
//                     d="M9.2 4L12 4 12 1.8"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.6"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </div>
//             </button>
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
import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation"; // 앱 회전 제어
import { RotateCw } from "lucide-react"; // 🔁 회전 아이콘
import type { User } from "../../types";
import type { LiveRoomSyncDTO } from "../../types/room";

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
  roomTitle: string;
  hostNickname?: string | null;
};

// 드리프트 보정 파라미터
const isNativeApp = Capacitor.isNativePlatform();

const DRIFT_TOLERANCE_HARD = 2.5;
const DRIFT_TOLERANCE_SOFT = isNativeApp ? 0.2 : 0.4;
const SOFT_CORRECT_MS = 1500;
const HEARTBEAT_MS = isNativeApp ? 3000 : 5000;

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
  roomTitle,
  hostNickname,
}) => {
  const playerRef = useRef<YT.Player | null>(null);

  // 🔁 앱 회전 상태 (세로 / 가로)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

  // 🔁 앱에서만 현재 orientation 동기화
  useEffect(() => {
    if (!isNativeApp) return;

    const init = async () => {
      try {
        const info = await ScreenOrientation.orientation();
        const isLand = info.type.startsWith("landscape");
        setOrientation(isLand ? "landscape" : "portrait");
      } catch {
        // 무시
      }
    };

    init();

    const sub = ScreenOrientation.addListener(
      "screenOrientationChange",
      (ev) => {
        const isLand = ev.type.startsWith("landscape");
        setOrientation(isLand ? "landscape" : "portrait");
      }
    );

    return () => {
      sub.then((s) => s.remove()).catch(() => {});
    };
  }, []);

  // 🔁 회전 토글 버튼 핸들러 (세로 <-> 가로)
  const handleOrientationToggle = async () => {
    if (!isNativeApp) return;

    try {
      if (orientation === "portrait") {
        await ScreenOrientation.lock({ orientation: "landscape" });
        setOrientation("landscape");
      } else {
        await ScreenOrientation.lock({ orientation: "portrait" });
        setOrientation("portrait");
      }
    } catch (e) {
      console.warn("회전 잠금 실패", e);
    }
  };

  // =================== 기존 동작 로직 ===================

  const initialUnlocked = (() => {
    try {
      return sessionStorage.getItem("audioUnlocked") === "1";
    } catch {
      return false;
    }
  })();
  const audioUnlockedRef = useRef<boolean>(initialUnlocked);

  const [canWatch, setCanWatch] = useState(false);
  const justSynced = useRef(false);

  const [muted, setMuted] = useState<boolean>(!audioUnlockedRef.current);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);

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
    try {
      if (p.getPlaybackRate() !== 1) {
        p.setPlaybackRate(1);
      }
    } catch {}
  };

  const endFiredRef = useRef(false);

  const onPlayerReady = async (event: YT.PlayerEvent) => {
    const p = event.target;
    playerRef.current = p;

    try {
      if (isHost) {
        p.unMute?.();
        p.setVolume?.(100);
        setMuted(false);
        await p.playVideo();
        setCanWatch(true);
      } else {
        if (audioUnlockedRef.current) {
          p.unMute?.();
          p.setVolume?.(100);
          setMuted(false);
          await p.playVideo();
          setCanWatch(true);
        } else {
          p.mute?.();
          p.setVolume?.(100);
          setMuted(true);
          p.pauseVideo();
        }
      }
    } catch {
      try {
        p.mute?.();
        setMuted(!audioUnlockedRef.current);
        await p.playVideo();
        setCanWatch(true);
      } catch {
        p.pauseVideo();
        setCanWatch(false);
      }
    }
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      if (!isHost) return;
      if (endFiredRef.current) return;
      endFiredRef.current = true;
      onVideoEnd();
      return;
    }

    if (event.data === YT.PlayerState.PLAYING) {
      endFiredRef.current = false;
    }

    const player = playerRef.current;
    if (!stompClient.connected || !player) return;

    if (!isHost) {
      if (event.data === YT.PlayerState.PAUSED && canWatch) {
        try {
          player.playVideo();
        } catch {}
        return;
      }
      if (event.data === YT.PlayerState.PLAYING) {
        if (justSynced.current) {
          justSynced.current = false;
          return;
        }
        if (!canWatch) player.pauseVideo();
      }
      return;
    }

    const payload: LiveRoomSyncDTO = {
      eventType: "SYNC_STATE",
      roomId,
      hostId: user.userId,
      title: roomTitle,
      hostNickname: hostNickname ?? user.nickname ?? "",
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

  useEffect(() => {
    if (!stompClient || !stompClient.connected || isHost) return;

    const waitAndSubscribe = () => {
      if (!playerRef.current) {
        setTimeout(waitAndSubscribe, 100);
        return;
      }

      let animationFrameId: number | null = null;
      let lastCheckTime = 0;
      const CHECK_INTERVAL = 300;

      const continuousDriftCheck = (timestamp: number) => {
        if (timestamp - lastCheckTime > CHECK_INTERVAL) {
          lastCheckTime = timestamp;
          const player = playerRef.current;
          if (player && canWatch) {
            try {
              player.getCurrentTime();
            } catch {}
          }
        }
        animationFrameId = requestAnimationFrame(continuousDriftCheck);
      };

      if (isNativeApp) {
        animationFrameId = requestAnimationFrame(continuousDriftCheck);
      }

      const subscription = stompClient.subscribe(
        `/topic/room/${roomId}`,
        (message) => {
          try {
            const parsed = JSON.parse(message.body) as LiveRoomSyncDTO;
            if (parsed.eventType !== "SYNC_STATE") return;

            const player = playerRef.current;
            if (!player) return;

            const now = Date.now();
            const expectedTime =
              typeof parsed.lastUpdated === "number"
                ? (parsed.currentTime ?? 0) +
                  (now - parsed.lastUpdated) / 1000
                : parsed.currentTime ?? 0;

            if (parsed.playing && muted) setShowUnmuteHint(true);

            const localTime = player.getCurrentTime();
            const delta = expectedTime - localTime;
            const absDrift = Math.abs(delta);

            if (parsed.playing) {
              if (!canWatch) {
                clearRateTimer();
                restoreNormalRate();
                player.seekTo(expectedTime, true);
                justSynced.current = true;
                player.playVideo();
                setCanWatch(true);
                return;
              }

              if (absDrift >= DRIFT_TOLERANCE_HARD) {
                clearRateTimer();
                restoreNormalRate();
                player.seekTo(expectedTime, true);
                justSynced.current = true;
              } else if (absDrift >= DRIFT_TOLERANCE_SOFT) {
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
                clearRateTimer();
                restoreNormalRate();
              }
            } else {
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

      return () => {
        subscription.unsubscribe();
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    };

    const cleanup = waitAndSubscribe();
    return () => {
      if (typeof cleanup === "function") cleanup();
      clearRateTimer();
      restoreNormalRate();
    };
  }, [stompClient, isHost, roomId, canWatch, muted]);

  useEffect(() => {
    if (!isHost || !stompClient.connected || isPlaylistUpdating) return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      const payload: LiveRoomSyncDTO = {
        eventType: "SYNC_STATE",
        roomId,
        hostId: user.userId,
        title: roomTitle,
        hostNickname: hostNickname ?? user.nickname ?? "",
        playlist,
        currentVideoIndex,
        currentTime: player.getCurrentTime(),
        playing:
          player.getPlayerState() === YT.PlayerState.PLAYING,
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
    roomTitle,
    hostNickname,
  ]);

  const prevIndexRef = useRef<number>(currentVideoIndex);
  const prevVideoIdRef = useRef<string>(videoId);
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;

    const videoChanged = prevVideoIdRef.current !== videoId;
    const indexChanged = prevIndexRef.current !== currentVideoIndex;

    if (videoChanged || indexChanged) {
      try {
        p.stopVideo?.();
        p.loadVideoById({
          videoId,
          startSeconds: 0,
        });
        if (isHost) {
          p.playVideo?.();
        }
      } catch (e) {
        console.warn("loadVideoById 실패", e);
      }

      prevVideoIdRef.current = videoId;
      prevIndexRef.current = currentVideoIndex;
    }
  }, [videoId, currentVideoIndex, isHost]);

  const handleUnmute = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.unMute();
      p.setVolume?.(100);
      setMuted(false);
      setShowUnmuteHint(false);
      audioUnlockedRef.current = true;
      sessionStorage.setItem("audioUnlocked", "1");
    } catch (e) {
      console.warn("unMute 실패", e);
    }
  };

  const initialMute = isHost ? 0 : (audioUnlockedRef.current ? 0 : 1);

  // =================== 렌더링 ===================
  return (
    <div className="relative w-full h-full bg-black">
      {videoId ? (
        <>
          <YouTube
            key={`${videoId}-${currentVideoIndex}`}
            videoId={videoId}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            className="w-full h-full"
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: isHost ? 1 : 0,
                mute: initialMute,
                controls: isHost ? 1 : 0,
                disablekb: 1,
                rel: 0,
                enablejsapi: 1,
                playsinline: 1,
                modestbranding: 1,
                iv_load_policy: 3,
              },
            }}
          />

          {/* 참가자: 호스트 재생 중 + 음소거 상태면 "사운드 켜기" 버튼 */}
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

          {/* 참가자: 호스트 play 전 대기 오버레이 */}
          {!isHost && !canWatch && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-20 w-full h-full flex items-center justify-center text-white text-lg">
                방장이 영상을 재생할 때까지 대기 중입니다...
              </div>
            </div>
          )}

          {isNativeApp && (
            <button
              type="button"
              onClick={handleOrientationToggle}
              className="
                absolute bottom-4 right-4 z-30
                active:scale-95 transition-transform
              "
            >
              <div
                className="
                  w-10 h-10 rounded-full
                  shadow-[0_4px_12px_rgba(0,0,0,0.35)]
                  border border-black/5
                  flex items-center justify-center
                "
              >
                <RotateCw className="w-5 h-5 text-gray-900" strokeWidth={2} />
              </div>
            </button>
          )}
        </>
      ) : (
        <div className="text-center text-white mt-10">영상 ID가 없습니다.</div>
      )}
    </div>
  );
};

export default VideoPlayer;

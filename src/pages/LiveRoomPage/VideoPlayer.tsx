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

// 드리프트 보정 파라미터 (필요시 숫자만 미세 조정)
const DRIFT_TOLERANCE_HARD = 2.5;   // 초: 이 이상 어긋나면 seekTo (하드 보정)
const DRIFT_TOLERANCE_SOFT = 0.4;   // 초: 이 이상이면 짧게 배속 보정
const SOFT_CORRECT_MS = 1500;       // ms: 소프트 보정 유지 시간
const HEARTBEAT_MS = 5000;          // ms: 방장 하트비트 주기

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

  // 시청 관련 상태
  const [canWatch, setCanWatch] = useState(false);   // 참가자 재생 허용(재생 중) 여부
  const justSynced = useRef(false);                  // sync 직후 onStateChange 가드

  // 오디오 상태 (초기 무조건 음소거)
  const [muted, setMuted] = useState(true);          // 참가자 음소거 상태
  const [showUnmuteHint, setShowUnmuteHint] = useState(false); // "사운드 켜기" 안내 버튼

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
    try {
      if (typeof p.getPlaybackRate === "function" && p.getPlaybackRate() !== 1) {
        p.setPlaybackRate(1);
      }
    } catch {}
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    playerRef.current = event.target;
    event.target.pauseVideo();
    // playerVars.mute=1이 초기 음소거를 보장하므로 여기서 mute()를 다시 호출하지 않는다.
    event.target.setVolume?.(100);
    setMuted(true); // 초기 화면 표시는 음소거로
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

    // 참가자 컨트롤: 정지 금지 및 허용 전 수동 재생 차단
    if (!isHost) {
      // 참가자가 일시정지하면 즉시 재생 복구 (호스트가 재생 중일 때의 UX 보호)
      if (event.data === YT.PlayerState.PAUSED && canWatch) {
        try { player.playVideo(); } catch {}
        return;
      }
      // 허용 전 수동 재생 차단
      if (event.data === YT.PlayerState.PLAYING) {
        if (justSynced.current) { justSynced.current = false; return; }
        if (!canWatch) player.pauseVideo();
      }
      return;
    }

    // === 방장: 상태 변경 즉시 브로드캐스트 ===
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

  // 참가자: 호스트 상태 구독 + 드리프트 기반 보정
  useEffect(() => {
    if (!stompClient || !stompClient.connected || isHost) return;

    const waitAndSubscribe = () => {
      if (!playerRef.current) { setTimeout(waitAndSubscribe, 100); return; }

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

            // 호스트가 재생 중일 때만 음소거 안내 버튼을 띄움
            if (parsed.playing && muted) {
              setShowUnmuteHint(true);
            }

            const localTime = player.getCurrentTime();
            const delta = expectedTime - localTime;
            const absDrift = Math.abs(delta);

            if (parsed.playing) {
              if (!canWatch) {
                // 첫 시작: 강제 동기화 후 재생 (음소거 유지)
                clearRateTimer(); restoreNormalRate();
                player.seekTo(expectedTime, true);
                justSynced.current = true;
                player.playVideo();     // mute 상태로 자동재생은 정책상 허용됨
                setCanWatch(true);
                return;
              }

              // 이미 시청 중: 드리프트 보정
              if (absDrift >= DRIFT_TOLERANCE_HARD) {
                clearRateTimer(); restoreNormalRate();
                player.seekTo(expectedTime, true);
                justSynced.current = true;
              } else if (absDrift >= DRIFT_TOLERANCE_SOFT) {
                const targetRate = delta > 0 ? 1.25 : 0.75; // 따라잡거나 살짝 늦춤
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
                clearRateTimer(); restoreNormalRate();
              }
            } else {
              // 호스트가 멈춤
              clearRateTimer(); restoreNormalRate();
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

    const cleanup = waitAndSubscribe();
    return () => {
      if (typeof cleanup === "function") cleanup();
      clearRateTimer();
      restoreNormalRate();
    };
  }, [stompClient, isHost, roomId, canWatch, muted]);

  // 방장: 주기적 상태 송신(하트비트). 플레이리스트 갱신 중에는 중단.
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
  }, [isHost, stompClient, isPlaylistUpdating, user, roomId, playlist, currentVideoIndex]);

  // 참가자: "사운드 켜기" (사용자 제스처)
  const handleUnmute = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.unMute();              // 제스처 기반으로 음소거 해제
      p.setVolume?.(100);
      setMuted(false);
      setShowUnmuteHint(false);
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
                  autoplay: 0,               // 자동재생 X
                  mute: 1,                   // 초기 무조건 음소거
                  controls: isHost ? 1 : 0,  // 참가자 조작 불가
                  disablekb: 1,              // 키보드 조작 차단
                  rel: 0,
                  enablejsapi: 1,
                  playsinline: 1,
                },
              }}
            />
          </div>

          {/* 참가자: 호스트가 재생 중이고 아직 음소거 상태면 "사운드 켜기" 버튼 노출 */}
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
        </>
      ) : (
        <div className="text-center text-white mt-10">영상 ID가 없습니다.</div>
      )}
    </div>
  );
};

export default VideoPlayer;

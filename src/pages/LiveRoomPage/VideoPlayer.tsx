import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { Client } from "@stomp/stompjs";
import type { User } from "../../types";
import type { LiveRoomSyncDTO } from "../../types/Room";

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
const DRIFT_TOLERANCE_HARD = 2.5;
const DRIFT_TOLERANCE_SOFT = 0.4;
const SOFT_CORRECT_MS = 1500;
const HEARTBEAT_MS = 5000;

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

  // 시청 관련 상태
  const [canWatch, setCanWatch] = useState(false); // 참가자 재생 허용(재생 중) 여부
  const justSynced = useRef(false); // sync 직후 onStateChange 가드

  // 오디오 상태 (초기 무조건 음소거)
  const [muted, setMuted] = useState(true); // 참가자 음소거 상태
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
      if (
        typeof p.getPlaybackRate === "function" &&
        p.getPlaybackRate() !== 1
      ) {
        p.setPlaybackRate(1);
      }
    } catch {}
  };

  // ENDED 중복 호출 방지
  const endFiredRef = useRef(false);

  const onPlayerReady = (event: YT.PlayerEvent) => {
    playerRef.current = event.target;
    event.target.pauseVideo();
    event.target.setVolume?.(100);
    setMuted(true);
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
      endFiredRef.current = false; // 다음 종료 감지 준비
    }

    const player = playerRef.current;
    if (!stompClient.connected || !player) return;

    // 참가자: 임의 조작 차단(호스트만 컨트롤)
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

    // 방장: 상태 브로드캐스트
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

  // 참가자: SYNC_STATE 구독 및 드리프트 보정
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
            const parsed = JSON.parse(message.body) as LiveRoomSyncDTO;
            if (parsed.eventType !== "SYNC_STATE") return;

            const player = playerRef.current;
            if (!player) return;

            const now = Date.now();
            const expectedTime =
              typeof parsed.lastUpdated === "number"
                ? (parsed.currentTime ?? 0) + (now - parsed.lastUpdated) / 1000
                : parsed.currentTime ?? 0;

            // 재생 안내 버튼
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
                player.playVideo(); // mute 상태면 자동재생 허용
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

      return () => subscription.unsubscribe();
    };

    const cleanup = waitAndSubscribe();
    return () => {
      if (typeof cleanup === "function") cleanup();
      clearRateTimer();
      restoreNormalRate();
    };
  }, [stompClient, isHost, roomId, canWatch, muted]);

  // 방장: 하트비트
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

  // 참가자: "사운드 켜기"
  const handleUnmute = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.unMute();
      p.setVolume?.(100);
      setMuted(false);
      setShowUnmuteHint(false);
    } catch (e) {
      console.warn("unMute 실패", e);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {videoId ? (
        <>
          <YouTube
            videoId={videoId}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            className="w-full h-full"
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: 0, // 초기 자동재생 X
                mute: 1, // 초기 무조건 음소거
                controls: isHost ? 1 : 0, // 참가자 조작 불가
                disablekb: 1, // 키보드 조작 차단
                rel: 0,
                enablejsapi: 1,
                playsinline: 1,
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
        </>
      ) : (
        <div className="text-center text-white mt-10">영상 ID가 없습니다.</div>
      )}
    </div>
  );
};

export default VideoPlayer;

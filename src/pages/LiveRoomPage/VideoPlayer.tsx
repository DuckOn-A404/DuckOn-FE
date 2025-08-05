import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { Socket } from "socket.io-client";

type VideoPlayerProps = {
  videoId: string;
  isHost: boolean;
  socket: Socket;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, isHost, socket }) => {
  const playerRef = useRef<YT.Player | null>(null);

  // 플레이어 준비되었을 때 참조 저장
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
  };

  // 방장일 경우: 재생/일시정지/이동 이벤트 감지하여 브로드캐스트
  const onPlayerStateChange = (event: any) => {
    if (!isHost || !playerRef.current) return;

    const player = playerRef.current;
    const currentTime = player.getCurrentTime();

    switch (event.data) {
      case 1: // 재생
        socket.emit("video-control", { type: "play", currentTime });
        break;
      case 2: // 일시정지
        socket.emit("video-control", { type: "pause", currentTime });
        break;
    }
  };

  // 참여자일 경우: 소켓으로 들어온 이벤트 수신해서 동기화
  useEffect(() => {
  if (!socket || isHost) return;

  socket.on("video-control", ({ type, currentTime }: { type: string; currentTime: number }) => {
    if (!playerRef.current) return;

    const player = playerRef.current;

    if (type === "play") {
      player.seekTo(currentTime, true);
      player.playVideo();
    } else if (type === "pause") {
      player.seekTo(currentTime, true);
      player.pauseVideo();
    }
  });

  return () => {
    socket.off("video-control");
  };
}, [socket, isHost]);

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

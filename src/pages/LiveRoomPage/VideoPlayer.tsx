// import React, { useEffect, useRef, useState } from "react";
// import YouTube from "react-youtube";
// import { Client } from "@stomp/stompjs";
// import type { User } from "../../types";

// type VideoPlayerProps = {
//   videoId: string;
//   isHost: boolean;
//   stompClient: Client;
//   user: User;
//   roomId: string;
// };

// const VideoPlayer: React.FC<VideoPlayerProps> = ({
//   videoId,
//   isHost,
//   stompClient,
//   user,
//   roomId,
// }) => {
//   const playerRef = useRef<YT.Player | null>(null);
//   const [canWatch, setCanWatch] = useState(false)
//   const shouldPlayAfterSeek = useRef(false)

//   const playlist = [videoId];
//   const currentVideoIndex = 0;

//   const onPlayerReady = (event: YT.PlayerEvent) => {
//     playerRef.current = event.target;
//     if (!isHost) {
//       event.target.pauseVideo(); // 참가자는 처음에 영상 멈춰놓기
//       event.target.mute();       // autoplay 제한 회피용 mute
//     }
//   };

//   const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
//     console.log("[상태 변경]", event.data);
//     console.log("stomp 연결 상태:", stompClient.connected);
//     console.log("isHost:", isHost);
//     const player = playerRef.current;
//     if (!player || !stompClient.connected) return;

//     const state = event.data;

//     // 참가자 조작 방지
//     if (!isHost && state === YT.PlayerState.PLAYING && !shouldPlayAfterSeek.current) {
//       player.pauseVideo();
//       return;
//     }

//     // 참가자: 버퍼링 → 플레이 → canWatch 켜기
//     if (!isHost) {
//       if (state === YT.PlayerState.PLAYING && shouldPlayAfterSeek.current) {
//         console.log("참가자: 재생 시작됨");
//         setCanWatch(true);
//         shouldPlayAfterSeek.current = false;
//       }
//       return;
//     }

//     // 방장: 상태 전송
//     const currentTime = player.getCurrentTime();
//     const playing = state === YT.PlayerState.PLAYING;

//     const payload = {
//       roomId: parseInt(roomId),
//       hostId: user.userId,
//       playlist,
//       currentVideoIndex,
//       currentTime,
//       playing,
//       lastUpdated: Date.now(),
//     };

//     const jsonPayload = JSON.stringify(payload);

//     console.log("[STOMP 전송 데이터]", jsonPayload);

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

//       const subscription = stompClient.subscribe(
//         `/topic/room/${roomId}`,
//         (message) => {
//           console.log("[참가자] 메시지 수신:", message.body);
//           try {
//             const { currentTime, playing } = JSON.parse(message.body);
//             const player = playerRef.current;
//             if (!player) return;

//             player.seekTo(currentTime, true);

//             player.mute();

//             if (playing) {
//               shouldPlayAfterSeek.current = true;
//             } else {
//               setCanWatch(false);
//               shouldPlayAfterSeek.current = false;
//               player.pauseVideo();
//             }
//           } catch (err) {
//             console.error("메시지 파싱 실패", err);
//           }
//         }
//       );

//       console.log(`Subscribed to /topic/room/${roomId}`);

//       return () => {
//         subscription.unsubscribe();
//         console.log(`Unsubscribed from /topic/room/${roomId}`);
//       };
//     };

//     waitAndSubscribe();
//   }, [stompClient, isHost, roomId]);

//   return (
//     <div className="relative w-full h-full">
//       {videoId ? (
//         <>
//           <YouTube
//             videoId={videoId}
//             onReady={onPlayerReady}
//             onStateChange={onPlayerStateChange}
//             opts={{
//               width: "100%",
//               height: "100%",
//               playerVars: {
//                 autoplay: 0,               // autoplay 설정
//                 mute: 1,                   // 브라우저 autoplay 정책 우회
//                 enablejsapi: 1, // JS API 사용 가능
//                 controls: 1,  // 참가자도 controls는 필요(JS API 작동을 위해)
//                 disablekb: 1,
//                 rel: 0,
//               },
//             }}
//           />
//           {!isHost && !canWatch && (
//             <>
//               <div
//                 className="absolute inset-0 z-10 bg-transparent cursor-not-allowed"
//                 style={{ pointerEvents: "auto" }}
//               />
//               <div className="absolute inset-0 z-20 flex items-center justify-center text-white text-lg bg-black/40">
//                 방장이 영상을 재생할 때까지 대기 중입니다...
//               </div>
//             </>
//           )}
//         </>
//       ) : (
//         <div className="text-center text-white mt-10">
//           영상 ID가 없습니다.
//         </div>
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

    if (!isHost) {
      event.target.mute();        // autoplay 허용 위해 필수
      event.target.pauseVideo();  // 입장 시 자동 정지
    }
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (!stompClient.connected || !playerRef.current) return;

    const player = playerRef.current;

    if (!isHost) {
      // 참가자가 재생 시도 시 강제 정지
      if (event.data === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      }
      return;
    }

    // 방장만 broadcast
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

            player.mute();  // mute 유지

            player.seekTo(currentTime, true);

            setTimeout(() => {
              if (playing) {
                player.playVideo();
                setCanWatch(true);
              } else {
                player.pauseVideo();
                setCanWatch(false);
              }
            }, 300);
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
                autoplay: 1,               // mute 조건이면 autoplay 가능
                mute: 1,
                enablejsapi: 1,
                controls: isHost ? 1 : 0,  // 방장만 컨트롤 허용
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

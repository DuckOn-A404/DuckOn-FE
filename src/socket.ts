// import { Client } from "@stomp/stompjs";

// export const createStompClient = (
//   accessToken: string,
//   onConnectCallback?: () => void
// ): Client => {
//   const scheme = window.location.protocol === "https:" ? "wss" : "ws";
//   const path = "/ws-chat";
//   let socketUrl = `${scheme}://${window.location.host}${path}`;

//   if (accessToken) {
//     socketUrl += `?token=${accessToken}`;
//   }

//   const client = new Client({
//     webSocketFactory: () => new WebSocket(socketUrl),
//     reconnectDelay: 5000,
//     debug: () => {},
//     onConnect: () => {
//       onConnectCallback?.();
//     },
//   });

//   return client;
// };


// import { Client } from "@stomp/stompjs";
// import { Capacitor } from "@capacitor/core";

// export const createStompClient = (
//   accessToken: string,
//   onConnectCallback?: () => void
// ): Client => {
//   let socketUrl: string;
  
//   // Capacitor 앱인지 확인
//   if (Capacitor.isNativePlatform()) {
//     // 네이티브 앱에서는 실제 서버 URL 사용
//     socketUrl = `wss://duckon.site/ws-chat`;
//   } else {
//     // 웹에서는 상대 경로 사용
//     const scheme = window.location.protocol === "https:" ? "wss" : "ws";
//     socketUrl = `${scheme}://${window.location.host}/ws-chat`;
//   }

//   if (accessToken) {
//     socketUrl += `?token=${accessToken}`;
//   }

//   const client = new Client({
//     webSocketFactory: () => new WebSocket(socketUrl),
//     reconnectDelay: 5000,
//     debug: (str) => {
//       console.log('STOMP:', str);
//     },
//     onConnect: () => {
//       console.log('✅ WebSocket Connected to:', socketUrl);
//       onConnectCallback?.();
//     },
//     onStompError: (frame) => {
//       console.error('❌ STOMP Error:', frame);
//     },
//     onWebSocketError: (event) => {
//       console.error('❌ WebSocket Error:', event);
//     }
//   });

//   return client;
// };

// import { Client } from "@stomp/stompjs";
// import { Capacitor } from "@capacitor/core";

// export const createStompClient = (
//   accessToken: string,
//   onConnectCallback?: () => void
// ): Client => {
//   let socketUrl: string;
  
//   // Capacitor 앱인지 확인
//   if (Capacitor.isNativePlatform()) {
//     // 네이티브 앱에서는 실제 서버 URL 사용
//     socketUrl = `wss://duckon.site/ws-chat`;
//   } else {
//     // 웹에서는 상대 경로 사용
//     const scheme = window.location.protocol === "https:" ? "wss" : "ws";
//     socketUrl = `${scheme}://${window.location.host}/ws-chat`;
//   }

//   if (accessToken) {
//     socketUrl += `?token=${accessToken}`;
//   }

//   const client = new Client({
//     webSocketFactory: () => new WebSocket(socketUrl),
//     reconnectDelay: 5000,
//     debug: (str) => {
//       console.log("STOMP:", str);
//     },
//     onConnect: () => {
//       console.log("✅ WebSocket Connected to:", socketUrl);
//       onConnectCallback?.();
//     },
//     onStompError: (frame) => {
//       console.error("❌ STOMP Error:", frame);
//     },
//     onWebSocketError: (event) => {
//       console.error("❌ WebSocket Error:", event);
//     },
//   });

//   return client;
// };

// /** ✅ GIF/이미지 URL 전송 헬퍼 */
// export const sendGifMessage = (
//   client: Client,
//   roomId: number | string,
//   url: string,
//   me: { id: string; nick: string }
// ) => {
//   if (!client?.connected) return;
//   if (!url) return;

//   client.publish({
//     // 🔧 백엔드 @MessageMapping("/room/chat") 에 맞춰 고정
//     destination: `/app/room/chat`,
//     body: JSON.stringify({
//       roomId: Number(roomId),
//       senderId: me.id,           // 서버가 다시 세팅해도 무방
//       senderNickName: me.nick,   // "
//       content: url,
//       isImage: true,             // 핵심 플래그
//     }),
//     headers: { "content-type": "application/json" },
//   });
// };

import { Client } from "@stomp/stompjs";
// import { Capacitor } from "@capacitor/core";

/** 🔧 API_BASE_URL → WS_BASE_URL 변환 */
const toWsUrl = (apiBase: string) => {
  // 1) http → ws, https → wss
  let wsBase = apiBase.replace(/^http/, "ws");

  // 2) /api 로 끝나면 /ws-chat 으로 변환
  wsBase = wsBase.replace(/\/api\/?$/, "/ws-chat");

  return wsBase;
};

export const createStompClient = (
  accessToken: string,
  onConnectCallback?: () => void
): Client => {
  let socketUrl: string;

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Capacitor 앱 여부와 상관없이 API_BASE_URL에서 WS URL 파생
  const WS_BASE = toWsUrl(API_BASE);

  socketUrl = WS_BASE;

  if (accessToken) {
    socketUrl += `?token=${accessToken}`;
  }

  const client = new Client({
    webSocketFactory: () => new WebSocket(socketUrl),
    reconnectDelay: 5000,
    debug: (str) => {
      console.log("STOMP:", str);
    },
    onConnect: () => {
      console.log("✅ WebSocket Connected to:", socketUrl);
      onConnectCallback?.();
    },
    onStompError: (frame) => {
      console.error("❌ STOMP Error:", frame);
    },
    onWebSocketError: (event) => {
      console.error("❌ WebSocket Error:", event);
    },
  });

  return client;
};

/** ✅ GIF/이미지 URL 전송 헬퍼 — (절대 수정 X) */
export const sendGifMessage = (
  client: Client,
  roomId: number | string,
  url: string,
  me: { id: string; nick: string }
) => {
  if (!client?.connected) return;
  if (!url) return;

  client.publish({
    destination: `/app/room/chat`,
    body: JSON.stringify({
      roomId: Number(roomId),
      senderId: me.id,
      senderNickName: me.nick,
      content: url,
      isImage: true,
    }),
    headers: { "content-type": "application/json" },
  });
};

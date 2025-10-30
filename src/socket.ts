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


import { Client } from "@stomp/stompjs";
import { Capacitor } from "@capacitor/core";

export const createStompClient = (
  accessToken: string,
  onConnectCallback?: () => void
): Client => {
  let socketUrl: string;
  
  // Capacitor 앱인지 확인
  if (Capacitor.isNativePlatform()) {
    // 네이티브 앱에서는 실제 서버 URL 사용
    socketUrl = `wss://duckon.site/ws-chat`;
  } else {
    // 웹에서는 상대 경로 사용
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    socketUrl = `${scheme}://${window.location.host}/ws-chat`;
  }

  if (accessToken) {
    socketUrl += `?token=${accessToken}`;
  }

  const client = new Client({
    webSocketFactory: () => new WebSocket(socketUrl),
    reconnectDelay: 5000,
    debug: (str) => {
      console.log('STOMP:', str);
    },
    onConnect: () => {
      console.log('✅ WebSocket Connected to:', socketUrl);
      onConnectCallback?.();
    },
    onStompError: (frame) => {
      console.error('❌ STOMP Error:', frame);
    },
    onWebSocketError: (event) => {
      console.error('❌ WebSocket Error:', event);
    }
  });

  return client;
};

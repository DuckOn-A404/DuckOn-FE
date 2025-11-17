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

/** API_BASE_URL → WS_BASE_URL 변환 */
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

/** GIF/이미지 URL 전송 헬퍼 — (절대 수정 X) */
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

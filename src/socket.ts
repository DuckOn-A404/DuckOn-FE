import { Client } from "@stomp/stompjs";

export const createStompClient = (
  accessToken: string,
  onConnectCallback?: () => void
): Client => {
  const socketUrl = `ws://i13a404.p.ssafy.io/ws-chat?token=${accessToken}`;

  const client = new Client({
    webSocketFactory: () => new WebSocket(socketUrl),
    reconnectDelay: 5000,
    debug: (str) => console.log("[STOMP]", str),
    onConnect: () => {
      console.log("STOMP 연결 성공");
      onConnectCallback?.();
    },
  });

  return client;
};
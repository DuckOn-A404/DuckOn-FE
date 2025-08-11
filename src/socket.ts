import { Client } from "@stomp/stompjs";

export const createStompClient = (
  accessToken: string,
  onConnectCallback?: () => void
): Client => {
  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  const path = "/ws-chat";
  let socketUrl = `${scheme}://${window.location.host}${path}`;

  if (accessToken) {
    socketUrl += `?token=${accessToken}`;
  }

  const client = new Client({
    webSocketFactory: () => new WebSocket(socketUrl),
    reconnectDelay: 5000,
    debug: (str) => console.log("[STOMP]", str),
    onConnect: () => {
      onConnectCallback?.();
    },
  });

  return client;
};

// src/socket/index.ts
import { Client } from "@stomp/stompjs";

// WebSocket + JWT (via query param) 연결용 클라이언트 생성 함수
export const createStompClient = (accessToken: string): Client => {
  // WebSocket URL에 JWT를 query parameter로 전달
  const socketUrl = `ws://localhost:8080/ws-chat?token=${accessToken}`;

  const client = new Client({
    // native WebSocket 사용
    webSocketFactory: () => new WebSocket(socketUrl),

    // 자동 재연결 (5초 후)
    reconnectDelay: 5000,

    // 디버깅 로그 출력
    debug: (str) => console.log("[STOMP]", str),
  });

  return client;
};

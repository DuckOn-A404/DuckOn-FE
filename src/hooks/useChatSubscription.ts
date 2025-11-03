// import { useState, useEffect } from "react";
// import { Client } from "@stomp/stompjs";
// import type { ChatMessage } from "../types/chat";

// /** 최근 유지할 최대 메시지 수 */
// const MAX_KEEP = 100;

// /**
//  * 활성화된 STOMP 클라이언트를 받아 채팅 구독 및 메시지 전송을 처리하는 훅
//  */
// export const useChatSubscription = (
//   client: Client | null,
//   roomId: string | undefined
// ) => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);

//   // 방이 바뀌면 메시지 초기화
//   useEffect(() => {
//     setMessages([]);
//   }, [roomId]);

//   // STOMP 연결 시 구독 + 수신 시 항상 최근 100개만 유지
//   useEffect(() => {
//     if (!client || !client.active || !roomId) return;

//     const sub = client.subscribe(`/topic/chat/${roomId}`, (frame) => {
//       const received: ChatMessage = JSON.parse(frame.body);
//       setMessages((prev) => {
//         const next = [...prev, received];
//         return next.length > MAX_KEEP ? next.slice(-MAX_KEEP) : next;
//       });
//     });

//     return () => sub.unsubscribe();
//   }, [client, client?.active, roomId]);

//   // 메시지 전송
//   const sendMessage = (content: string) => {
//     if (!client || !client.active || !roomId) return;
//     const payload = { roomId: Number(roomId), content };
//     client.publish({
//       destination: "/app/room/chat",
//       body: JSON.stringify(payload),
//     });
//   };

//   return { messages, sendMessage };
// };

import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import type { ChatMessage } from "../types/chat";

/** 최근 유지할 최대 메시지 수 */
const MAX_KEEP = 100;

/**
 * 활성화된 STOMP 클라이언트를 받아 채팅 구독 및 메시지 전송을 처리하는 훅
 */
export const useChatSubscription = (
  client: Client | null,
  roomId: string | undefined
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 방이 바뀌면 메시지 초기화
  useEffect(() => {
    setMessages([]);
  }, [roomId]);

  // STOMP 연결 시 구독 + 수신 시 항상 최근 100개만 유지
  useEffect(() => {
    if (!client || !client.active || !roomId) return;

    // 🔧 백엔드 convertAndSend("/topic/chat/{roomId}") 경로와 일치
    const sub = client.subscribe(`/topic/chat/${roomId}`, (frame) => {
      const received: ChatMessage = JSON.parse(frame.body);
      setMessages((prev) => {
        const next = [...prev, received];
        return next.length > MAX_KEEP ? next.slice(-MAX_KEEP) : next;
      });
    });

    return () => sub.unsubscribe();
  }, [client, client?.active, roomId]);

  // 메시지 전송(텍스트)
  const sendMessage = (content: string) => {
    if (!client || !client.connected || !roomId) return;
    const payload = { roomId: Number(roomId), content, isImage: false };
    client.publish({
      // 🔧 백엔드 @MessageMapping("/room/chat") 에 맞춰 고정
      destination: "/app/room/chat",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
    });
  };

  return { messages, sendMessage };
};

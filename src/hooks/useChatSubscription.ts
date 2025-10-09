// import { useState, useEffect } from "react";
// import { Client } from "@stomp/stompjs";
// import type { ChatMessage } from "../types/chat";

// /**
//  * 활성화된 STOMP 클라이언트를 받아 채팅 구독 및 메시지 전송을 처리하는 훅
//  * @param client - 부모 컴포넌트에서 관리하는 STOMP 클라이언트 인스턴스
//  * @param roomId - 접속할 채팅방의 ID
//  */
// export const useChatSubscription = (
//   client: Client | null,
//   roomId: string | undefined
// ) => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);

//   // 1. STOMP 클라이언트가 연결되면 채팅 채널을 구독
//   useEffect(() => {
//     if (client && client.active && roomId) {
//       const subscription = client.subscribe(
//         `/topic/chat/${roomId}`,
//         (message) => {
//           const receivedMessage = JSON.parse(message.body);
//           // console.log("📩 수신 메시지 구조", receivedMessage);
//           setMessages((prev) => [...prev, receivedMessage]);
//         }
//       );

//       return () => {
//         subscription.unsubscribe();
//       };
//     }
//   }, [client, client?.active, roomId]);

//   // 2. 메시지 전송 함수
//   const sendMessage = (content: string) => {
//     if (client && client.active && roomId) {
//       const messageToSend = { roomId: Number(roomId), content };
//       client.publish({
//         destination: "/app/room/chat",
//         body: JSON.stringify(messageToSend),
//       });
//     }
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
 * @param client - 부모 컴포넌트에서 관리하는 STOMP 클라이언트 인스턴스
 * @param roomId - 접속할 채팅방의 ID
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

    const sub = client.subscribe(`/topic/chat/${roomId}`, (frame) => {
      const received: ChatMessage = JSON.parse(frame.body);
      setMessages((prev) => {
        const next = [...prev, received];
        return next.length > MAX_KEEP ? next.slice(-MAX_KEEP) : next;
      });
    });

    return () => sub.unsubscribe();
  }, [client, client?.active, roomId]);

  // 메시지 전송
  const sendMessage = (content: string) => {
    if (!client || !client.active || !roomId) return;
    const payload = { roomId: Number(roomId), content };
    client.publish({
      destination: "/app/room/chat",
      body: JSON.stringify(payload),
    });
  };

  return { messages, sendMessage };
};

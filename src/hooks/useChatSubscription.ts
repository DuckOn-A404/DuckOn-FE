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
// useChatSubscription.ts
import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import type { ChatMessage } from "../types/chat";

const getOrCreateGuestId = () => {
  const KEY = "guestId";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (crypto?.randomUUID?.() ?? "guest-" + Math.random().toString(36).slice(2));
    localStorage.setItem(KEY, id);
  }
  return id;
};

/**
 * 활성화된 STOMP 클라이언트를 받아 채팅 구독 및 메시지 전송을 처리하는 훅
 */
export const useChatSubscription = (
  client: Client | null,
  roomId: string | undefined
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 1) 연결된 뒤에만 구독
  useEffect(() => {
    if (!client || !client.connected || !roomId) return;

    // 서버 토픽과 동일하게 맞추기 (서버가 /topic/room/{roomId}면 아래도 동일)
    const subscription = client.subscribe(`/topic/room/${roomId}`, (message) => {
      const receivedMessage = JSON.parse(message.body);
      setMessages((prev) => [...prev, receivedMessage]);
    });

    return () => subscription.unsubscribe();
  }, [client, client?.connected, roomId]);

  // 2) 메시지 전송 (guestId, guestNickname 포함)
  const sendMessage = (content: string) => {
    if (!client || !client.connected || !roomId) return;

    const guestId = getOrCreateGuestId();
    const guestNickname =
      localStorage.getItem("guestNickname")?.trim() || "게스트";

    client.publish({
      destination: "/app/room/chat",
      body: JSON.stringify({
        roomId: Number(roomId),
        content,
        guestId,          // 서버가 게스트면 senderId로 그대로 사용
        guestNickname,    // (선택) 표시명
        sentAt: Date.now()
      }),
      // 필요 시 헤더로도 보낼 수 있음:
      // headers: { "x-guest-id": guestId, "x-guest-nickname": guestNickname },
    });
  };

  return { messages, sendMessage };
};

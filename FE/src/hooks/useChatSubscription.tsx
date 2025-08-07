import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { getChatHistory } from "../api/chatService";
import type { ChatMessage } from "../types/chat";

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

  // 1. 초기 대화 기록 불러오기
  useEffect(() => {
    if (!roomId) return;

    getChatHistory(roomId)
      .then((history) => setMessages(history || []))
      .catch((error) => console.error("대화 기록 로딩 실패:", error));
  }, [roomId]);

  // 2. STOMP 클라이언트가 연결되면 채팅 채널을 구독
  useEffect(() => {
    if (client && client.active && roomId) {
      const subscription = client.subscribe(
        `/topic/chat/${roomId}`,
        (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [client, client?.active, roomId]);

  // 3. 메시지 전송 함수
  const sendMessage = (content: string) => {
    if (client && client.active && roomId) {
      const messageToSend = { roomId: Number(roomId), content };
      client.publish({
        destination: "/app/room/chat",
        body: JSON.stringify(messageToSend),
      });
    }
  };

  return { messages, sendMessage };
};

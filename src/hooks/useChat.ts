// src/hooks/useChat.ts
import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { createStompClient } from "../api/stompService";
import { getChatHistory } from "../api/chatService";
import { useUserStore } from "../store/useUserStore";
import type { ChatMessage } from "../types/chat";

/**
 * 채팅방의 실시간 통신 및 상태 관리를 담당하는 커스텀 훅
 * @param roomId - 접속할 채팅방의 ID
 */
export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const { myUser } = useUserStore();

  useEffect(() => {
    if (!roomId || !myUser) return;

    // --- 1. 이전 대화 기록 불러오기 ---
    const fetchHistory = async () => {
      try {
        const history = await getChatHistory(roomId);
        setMessages(history);
      } catch (error) {
        console.error("대화 기록을 불러오는 데 실패했습니다.", error);
      }
    };
    fetchHistory();

    // --- 2. STOMP 클라이언트 생성/연결 ---
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const client = createStompClient(token);
    stompClientRef.current = client;

    client.onConnect = () => {
      console.log("STOMP 연결 성공!");
      setIsConnected(true);

      // 2-1. 채팅방 채널 구독 (메시지 수신)
      client.subscribe(`/topic/rooms/${roomId}`, (message) => {
        const receivedMessage = JSON.parse(message.body) as ChatMessage;
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });

      // 2-2. 입장 메시지 전송
      const enterMessage = {
        roomId,
        senderId: myUser.userId,
        senderName: myUser.nickname,
        content: `${myUser.nickname}님이 입장했습니다.`,
      };
      client.publish({
        destination: `/app/chat/enter`,
        body: JSON.stringify(enterMessage),
      });
    };

    // 연결 실패 또는 끊겼을 때 실행될 콜백 함수
    client.onDisconnect = () => {
      console.log("STOMP 연결 해제됨");
      setIsConnected(false);
    };

    // STOMP 클라이언트 활성화 (연결 시작)
    client.activate();

    // --- 3. 컴포넌트 언마운트 시 정리 작업 ---
    return () => {
      if (client) {
        console.log("STOMP 연결을 해제합니다.");
        client.deactivate();
      }
    };
  }, [roomId, myUser]);

  /**
   * 채팅 메시지를 서버로 전송하는 함수
   * @param content - 보낼 메시지 내용
   */
  const sendMessage = (content: string) => {
    if (stompClientRef.current && isConnected && myUser) {
      const chatMessage = {
        roomId,
        senderId: myUser.userId,
        senderName: myUser.nickname,
        content,
      };
      stompClientRef.current.publish({
        destination: `/app/chat/message`,
        body: JSON.stringify(chatMessage),
      });
    }
  };

  return { messages, isConnected, sendMessage };
};

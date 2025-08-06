// src/hooks/useChat.ts
import { useState, useEffect, useRef } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import { createStompClient } from "../api/stompService";
import { getChatHistory } from "../api/chatService";
import { useUserStore } from "../store/useUserStore";
import type { ChatMessage, ChatMessageRequest } from "../types/chat";

/**
 * 채팅방의 실시간 통신 및 상태 관리를 담당하는 커스텀 훅
 * @param roomId - 접속할 채팅방의 ID
 */
export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<ReturnType<Client["subscribe"]> | null>(null);
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

    // 2. STOMP 연결 설정
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const client = createStompClient(token);
    stompClientRef.current = client;

    client.onConnect = () => {
      console.log("STOMP 연결 성공!");
      setIsConnected(true);

      // 2-1. 메시지 구독
      const subscription = client.subscribe(
        `/topic/rooms/${roomId}`,
        (message: IMessage) => {
          try {
            const received = JSON.parse(message.body) as ChatMessage;
            setMessages((prev) => [...prev, received]);
          } catch (error) {
            console.error("메시지 파싱 실패:", error);
          }
        }
      );

      subscriptionRef.current = subscription;

      // 2-2. 입장 메시지 전송
      const enterMessage: ChatMessageRequest = {
        roomId,
        senderId: myUser.userId,
        senderName: myUser.nickname,
        content: `${myUser.nickname}님이 입장했습니다.`,
        timestamp: Date.now().toString(),
        chatType: "ENTER",
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

    // STOMP 클라이언트 활성화
    client.activate();

    // --- 3. 컴포넌트 언마운트 시 정리 작업 ---
    return () => {
      console.log("STOMP 클라이언트 정리");
      subscriptionRef.current?.unsubscribe();
      client.deactivate();
    };
  }, [roomId, myUser]);

  /**
   * 채팅 메시지를 서버로 전송하는 함수
   * @param content - 보낼 메시지 내용
   */
  const sendMessage = (content: string) => {
    if (!stompClientRef.current || !isConnected || !myUser) return;

    const chatMessage: ChatMessageRequest = {
      roomId,
      senderId: myUser.userId,
      senderName: myUser.nickname,
      content,
      timestamp: Date.now().toString(),
      chatType: "TALK",
    };

    stompClientRef.current.publish({
      destination: `/app/chat/message`,
      body: JSON.stringify(chatMessage),
    });

    // [선택] 낙관적 렌더링 (서버에서 echo 해주면 생략 가능)
    // setMessages((prev) => [...prev, chatMessage]);
  };

  return { messages, isConnected, sendMessage };
};

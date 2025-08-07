import { useState, useEffect, useCallback } from "react";
import { getChatHistory } from "../api/chatService";
import type { ChatMessage } from "../types/chat";

/**
 * 채팅방의 데이터(메시지 목록)를 관리하는 커스텀 훅.
 * 웹소켓 연결 자체는 처리하지 않으며, 초기 대화 기록을 불러오고
 * 외부(웹소켓)로부터 받은 새 메시지를 목록에 추가하는 역할을 합니다.
 * @param roomId - 조회할 채팅방의 ID
 */
export const useChat = (roomId: string) => {
  // 1. 메시지 목록 상태만 관리
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 2. 컴포넌트가 마운트되거나 roomId가 바뀔 때, 이전 대화 기록을 불러옵니다.
  useEffect(() => {
    if (!roomId) return;

    const fetchHistory = async () => {
      try {
        const history = await getChatHistory(roomId);
        setMessages(history || []);
      } catch (error) {
        console.error("대화 기록을 불러오는 데 실패했습니다.", error);
        setMessages([]);
      }
    };

    fetchHistory();
  }, [roomId]);

  /**
   * 외부(웹소켓 구독 콜백)에서 받은 새 메시지를 메시지 목록에 추가하는 함수입니다.
   * 이 함수는 부모 컴포넌트(LiveRoomPage)에서 호출해줘야 합니다.
   * @param newMessage - 새로 도착한 메시지 객체
   */
  const addMessage = useCallback((newMessage: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

  // 3. 관리하는 메시지 목록과, 메시지를 추가하는 함수를 반환합니다.
  return { messages, addMessage };
};

// src/hooks/useArtistChat.ts

import { useState, useEffect } from "react";
import { getArtistMessages, postArtistMessage } from "../api/artistChatService";
import { useUserStore } from "../store/useUserStore";
import type { ChatMessage } from "../types/artistChat";

export const useArtistChat = (artistId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { myUser } = useUserStore();

  const fetchMessages = async () => {
    try {
      const latestMessages = await getArtistMessages(artistId);
      setMessages(latestMessages);
    } catch (error) {
      console.error("채팅 메시지를 불러오는 데 실패했습니다:", error);
    }
  };

  useEffect(() => {
    if (!artistId) return;
    fetchMessages();

    const intervalId = setInterval(fetchMessages, 5000);

    return () => clearInterval(intervalId);
  }, [artistId]);

  const sendMessage = async (content: string) => {
    if (!myUser) return;
    try {
      await postArtistMessage(artistId, {
        senderId: myUser.userId,
        senderName: myUser.nickname,
        content,
      });
      await fetchMessages();
    } catch (error) {
      console.error("메시지 전송에 실패했습니다:", error);
    }
  };

  return { messages, sendMessage };
};

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getBlockedUsers } from "../api/userService";
import { getArtistMessages, postArtistMessage } from "../api/artistChatService";
import { useUserStore } from "../store/useUserStore";
import type { artistChatMessage } from "../types/artistChat";

/**
 * HTTP Polling 방식으로 아티스트 채팅 데이터를 관리하는 커스텀 훅 (안정성 개선 버전)
 * @param artistId - 채팅방의 대상이 되는 아티스트 ID
 */
export const useArtistChat = (artistId: string) => {
  const [messages, setMessages] = useState<artistChatMessage[]>([]);
  const { myUser } = useUserStore();
  const lastTimestampRef = useRef<string | null>(null);

  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      const blockedUsers = await getBlockedUsers();
      const ids = new Set(blockedUsers.map((user) => user.userId));
      setBlockedUserIds(ids);
    };
    fetchBlockedUsers();
  }, []);

  const fetchNewMessages = useCallback(async () => {
    if (!artistId) return;
    try {
      const newMessages = await getArtistMessages(
        artistId,
        lastTimestampRef.current ?? undefined
      );

      if (newMessages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.messageId));
          const uniqueNewMessages = newMessages.filter(
            (msg) => !existingIds.has(msg.messageId)
          );

          if (uniqueNewMessages.length > 0) {
            lastTimestampRef.current =
              uniqueNewMessages[uniqueNewMessages.length - 1].sentAt;
            return [...prev, ...uniqueNewMessages];
          }
          return prev;
        });
      }
    } catch {}
  }, [artistId]);

  useEffect(() => {
    if (!artistId) return;

    const fetchInitialMessages = async () => {
      try {
        const initialMessages = await getArtistMessages(artistId);
        // 시간순으로 정렬
        initialMessages.sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        setMessages(initialMessages);

        if (initialMessages.length > 0) {
          lastTimestampRef.current =
            initialMessages[initialMessages.length - 1].sentAt;
        }
      } catch {}
    };

    fetchInitialMessages();

    const intervalId = setInterval(fetchNewMessages, 3000);

    return () => clearInterval(intervalId);
  }, [artistId, fetchNewMessages]);

  const sendMessage = async (content: string) => {
    if (!myUser || !content.trim()) return;
    try {
      await postArtistMessage(artistId, content);
      await fetchNewMessages();
    } catch {}
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => !blockedUserIds.has(msg.userId));
  }, [messages, blockedUserIds]);

  return { messages: filteredMessages, sendMessage };
};

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getBlockedUsers } from "../api/userService";
import { getArtistMessages, postArtistMessage } from "../api/artistChatService";
import { useUserStore } from "../store/useUserStore";
import type { artistChatMessage } from "../types/artistChat";

/**
 * HTTP Polling 방식으로 아티스트 채팅 데이터를 관리하는 커스텀 훅
 * @param artistId - 채팅방의 대상이 되는 아티스트 ID
 */
export const useArtistChat = (artistId: string) => {
  const [messages, setMessages] = useState<artistChatMessage[]>([]);
  const { myUser } = useUserStore();
  const lastTimestampRef = useRef<string | null>(null);

  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());

  
  // 차단 유저 목록 불러오기
  // - 로그인한 유저만 불러옴
  useEffect(() => {
    if (!myUser) return; 

    const fetchBlockedUsers = async () => {
      try {
        const blockedUsers = await getBlockedUsers();
        const ids = new Set(blockedUsers?.map((u) => u.userId) ?? []);
        setBlockedUserIds(ids);
      } catch {
        setBlockedUserIds(new Set()); 
      }
    };
    fetchBlockedUsers();
  }, []);


  // 신규 메시지 가져오기 (Polling이라 재사용 가능하도록)
  // - 마지막 받은 메시지 이후의 메시지만 서버에 요청
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


  // 초기 메시지 로드 
  // - 로그인한 사용자만 폴링 요청을 지속적으로 보냄
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

  // 메시지 전송
  const sendMessage = async (content: string) => {
    if (!myUser || !content.trim()) return;
    try {
      await postArtistMessage(artistId, content);
      await fetchNewMessages();
    } catch {}
  };

  // 차단한 유저 메시지 필터링
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => !blockedUserIds.has(msg.userId));
  }, [messages, blockedUserIds]);

  return { messages: filteredMessages, sendMessage };
};

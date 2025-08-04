import type { ChatMessage } from "../types/artistChat";
// DB 대신 사용할 가짜 메시지 저장소
const mockMessages: ChatMessage[] = [
  {
    messageId: "1",
    senderId: "101",
    senderName: "팬1",
    content: "오늘 무대 최고였어요!",
    timestamp: new Date().toISOString(),
  },
  {
    messageId: "2",
    senderId: "202",
    senderName: "팬2",
    content: "다들 보셨나요? ㄷㄷ",
    timestamp: new Date().toISOString(),
  },
];

/**
 * [Mock] 특정 아티스트의 메시지 목록을 가져오는 가짜 API
 */
export const getArtistMessages = async (
  artistId: string
): Promise<ChatMessage[]> => {
  console.log(`[Mock API] 아티스트 ${artistId}의 메시지를 가져옵니다.`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockMessages];
};

/**
 * [Mock] 특정 아티스트 채팅방에 새 메시지를 보내는 가짜 API
 */
export const postArtistMessage = async (
  artistId: string,
  message: { senderId: string; senderName: string; content: string }
): Promise<ChatMessage> => {
  console.log(
    `[Mock API] 아티스트 ${artistId}에게 메시지 전송:`,
    message.content
  );
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newMessage: ChatMessage = {
    messageId: String(Date.now()),
    ...message,
    timestamp: new Date().toISOString(),
  };

  mockMessages.push(newMessage);
  return newMessage;
};

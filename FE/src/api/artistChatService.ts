import { api } from "./axiosInstance";
import type { artistChatMessage } from "../types/artistChat";

/**
 * 특정 아티스트의 채팅 메시지 목록을 가져옵니다.
 * 'since' 파라미터를 사용하여 효율적인 폴링(Polling)을 지원합니다.
 * @param artistId - 채팅 내역을 조회할 아티스트의 식별자
 * @param since - 이 시각(ISO 8601 형식) 이후의 메시지만 조회합니다.
 * @returns 채팅 메시지 배열
 */
export const getArtistMessages = async (
  artistId: string,
  since?: string
): Promise<artistChatMessage[]> => {
  try {
    const response = await api.get(`/chat/artist/${artistId}/message`, {
      params: { since },
    });

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      return [];
    }
  } catch {
    return [];
  }
};

/**
 * 특정 아티스트 채팅방에 새 메시지를 전송합니다.
 * @param artistId - 메시지를 보낼 아티스트의 식별자
 * @param content - 보낼 메시지의 내용
 * @returns 성공 여부 또는 생성된 메시지 데이터
 */
export const postArtistMessage = async (
  artistId: string,
  content: string
): Promise<any> => {
  const response = await api.post(`/chat/artist/${artistId}/message`, {
    content,
  });
  return response.data;
};

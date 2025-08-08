import {api} from "./axiosInstance"; // 기존 axios 인스턴스 사용
import type {ChatMessage} from "../types/chat";

/**
 * 특정 채팅방의 이전 대화 기록을 가져오는 API 함수
 * @param roomId - 조회할 방의 ID
 * @returns - 메시지 배열
 */
export const getChatHistory = async (
	roomId: string
): Promise<ChatMessage[]> => {
	// 실제 백엔드와 약속된 엔드포인트로 수정해야 합니다.
	const response = await api.get(`/chat/rooms/${roomId}/messages`);

	// 백엔드 응답 구조에 따라 `response.data.messageList` 등으로 변경될 수 있습니다.
	return response.data;
};

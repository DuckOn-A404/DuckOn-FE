import { api } from "./axiosInstance"

/**
 * 사용자 팔로우 API 요청
 * @param userId 팔로우할 유저 ID
 * @returns 서버 응답 메시지
 */

export const followUser = async (userId: string): Promise<string> => {
    const response = await api.post(`/api/users/${userId}/follow`)
    return response.data.message
}
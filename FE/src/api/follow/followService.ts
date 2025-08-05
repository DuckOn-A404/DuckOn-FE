import { api } from "../axiosInstance"

/**
 * 사용자 팔로우 API 요청
 * @param userId 팔로우할 유저 ID
 * @returns 서버 응답 메시지
 */

// 팔로우 요청(post)
export const followUser = async (userId: string): Promise<string> => {
    const token = localStorage.getItem("accessToken") || ""
    const response = await api.post(
        `/api/users/${userId}/follow`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return response.data.message
}

// 언팔로우 요청(delete)
export const unfollowUser = async(userId: string): Promise<string> => {
    const token = localStorage.getItem("accessToken") || ""
    const response = await api.delete(`/api/users/${userId}/follow`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response.data.message
}
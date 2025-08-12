import { api } from "../axiosInstance";

/**
 * 사용자 팔로우 API 요청
 * @param userId 팔로우할 유저 ID
 * @returns 서버 응답 메시지
 */

// 팔로우 요청(post)
export const followUser = async (userId: string): Promise<string> => {
  const { data } = await api.post<{ message: string }>(
    `/users/${userId}/follow`
  );
  return data.message;
};

// 언팔로우 요청(delete)
export const unfollowUser = async (userId: string): Promise<string> => {
  const { data } = await api.delete<{ message: string }>(
    `/users/${userId}/follow`
  );
  return data.message;
};

import { api, getRefreshToken } from "./axiosInstance";
import { type MyUser } from "../types/mypage";
import { type RecommendedUser } from "../types";

type BlockedUser = {
  userId: string;
  nickname: string;
  imgUrl: string | null;
};

type ApiMessage = { message: string };

// 현재 사용자 정보 조회
export const fetchMyProfile = async (): Promise<MyUser> => {
  const response = await api.get<MyUser>("/users/me");
  return response.data;
};

// 타 유저 정보 조회
export const fetchOtherUserProfile = async (
  userId: string
): Promise<MyUser> => {
  const response = await api.get<MyUser>(`/users/${userId}`);
  return response.data;
};

/**
 * 비밀번호 확인 API (비밀번호가 맞는지 서버에서 검증)
 * @param password 입력한 현재 비밀번호
 * @returns 성공 시 true, 실패 시 예외 발생
 */
export const verifyPassword = async (password: string): Promise<boolean> => {
  try {
    const response = await api.post("/users/me/verify-password", { password });
    return response.data.valid === true;
  } catch (error) {
    console.error("비밀번호 검증 실패", error);
    throw error;
  }
};

/**
 * 유저 프로필 수정 API
 * 백엔드 명세에 따라 multipart/form-data 형식으로 요청
 * profileImg는 파일 전송용이고, 나머지는 일반 string
 * 그래도 넘어가는건 formData 형식으로 넘어가게 될것
 *
 * @param formData - FormData 객체(nickname, language, oldPassword, newPassword, profileImg)
 * @returns 백엔드에서 응답받은 수정된 유저 정보 객체
 */
export const updateUserProfile = async (
  formData: FormData
): Promise<MyUser> => {
  const response = await api.patch("/users/me", formData);
  return response.data;
};

/**
 * 차단한 사용자 목록을 가져오는 API 함수
 * @returns 차단된 사용자 목록 배열
 */
export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
  try {
    const response = await api.get("/block");
    return response.data.blockedList || [];
  } catch {
    return [];
  }
};

/**
 * 회원 탈퇴를 위한 API 함수
 * @param userId - 차단할 사용자의 ID
 * @returns 성공 메시지
 */
export const blockUser = async (
  userId: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/block/${userId}`);

    return response.data;
  } catch (error) {
    console.error("사용자 차단 API 호출에 실패했습니다:", error);
    throw error;
  }
};

// 회원탈퇴: DELETE /users/me (X-Refresh-Token 필수)
export const deleteMyAccount = async (
  refreshOverride?: string
): Promise<ApiMessage> => {
  const refresh = refreshOverride ?? getRefreshToken();
  if (!refresh)
    throw new Error("리프레시 토큰이 없어 회원탈퇴 요청을 보낼 수 없습니다.");

  const res = await api.delete<ApiMessage>("/users/me", {
    headers: { "X-Refresh-Token": refresh },
  });
  return res.data;
};

/**
 * 특정 아티스트 기반으로 비슷한 취향의 유저를 추천받는 API 함수
 * @param artistId - 현재 보고 있는 아티스트의 ID
 * @returns 추천 유저 목록 (Promise)
 */
export const getRecommendedUsers = async (
  artistId?: number,
  size: number = 10,
  includeReasons: boolean = false
): Promise<RecommendedUser[]> => {
  const response = await api.get<{ users: RecommendedUser[] }>(
    "/users/recommendations",
    {
      params: {
        artistId,
        size,
        includeReasons,
      },
      //   skipAuth: true, -> 백에서 수정되면 주석 풀기
    }
  );

  return response.data.users;
};

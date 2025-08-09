import { api } from "./axiosInstance";
import { type MyUser } from "../types/mypage";

type BlockedUser = {
  userId: string;
  nickname: string;
  imgUrl: string | null;
};

// 현재 사용자 정보 조회
export const fetchMyProfile = async (): Promise<MyUser> => {
  // 실제 백엔드 연동용 코드
  // Authorization 헤더가 빠져있다면 로그인 직후가 아닌 경우에는 헤더가 사라져서 /api/users/me가 로그인 페이지 HTML을 반환
  const token = localStorage.getItem("accessToken");

  const response = await api.get<MyUser>("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 타 유저 정보 조회
export const fetchOtherUserProfile = async (
  userId: string
): Promise<MyUser> => {
  // 실제 백엔드 연동 시:
  const response = await api.get<MyUser>(`/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    },
  });
  return response.data;
};

/**
 * 비밀번호 확인 API (비밀번호가 맞는지 서버에서 검증)
 * @param password 입력한 현재 비밀번호
 * @returns 성공 시 true, 실패 시 예외 발생
 */
export const verifyPassword = async (password: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("accessToken") || "";
    const response = await api.post(
      "/users/me/verify-password",
      { password },
      {
        headers: {
          Authorization: `Bearer ${token}`, // 토큰 반드시 포함해줄것 -> 새로고침시 매번 오류 발생 수정 위해
        },
      }
    );
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
  const response = await api.patch("/users/me", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    },
  });
  return response.data;
};

/**
 * 특정 사용자를 차단하는 API 함수
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

/**
 * 차단한 사용자 목록을 가져오는 API 함수
 * @returns 차단된 사용자 목록 배열
 */
export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await api.get("/block", {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data.blockedList || [];
  } catch {
    return [];
  }
};

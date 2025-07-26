import { api } from "./axiosInstance";
import { type MyUser } from "../types/mypage";

// 백엔드 미연결 시 mock 데이터 사용
const mockUser: MyUser = {
    email: "test@example.com",
    userId: "testuser",
    nickname: "Mock User",
    role: "USER",
    artistList: [1, 2, 3],
    bannedTill: undefined,
    profileImg: undefined,
    followingCount: 89,
    followerCount: 1247,
    language: "ko",
    password: "1234",
};

// 현재 사용자 정보 조회
export const fetchMyProfile = async (): Promise<MyUser> => {
    // 실제 백엔드 연동용 코드
    // const response = await api.get<MyUser>("/api/user/profile")
    // return response.data;

    return Promise.resolve(mockUser);
}

/**
 * 비밀번호 확인 API (비밀번호가 맞는지 서버에서 검증)
 * @param password 입력한 현재 비밀번호
 * @returns 성공 시 true, 실패 시 예외 발생
 */
export const verifyPassword = async (password: string): Promise<boolean> => {
  // 실제 백엔드 통신(나중에 사용)
  // try {
  //   const response = await api.post("/api/user/verify-password", { password });
  //   return response.data.valid === true; // 서버는 { valid: true } 형태로 응답한다고 가정
  // } catch (error) {
  //   console.error("비밀번호 검증 실패", error);
  //   throw error;
  // }
  // 현재는 mock 기반 로직
  return Promise.resolve(password === mockUser.password)
};
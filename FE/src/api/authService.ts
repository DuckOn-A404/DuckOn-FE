// 인증 관련 API 함수들
import { api } from "./axiosInstance";
import { type SignupData } from "../types/auth";

/**
 * 회원가입 API 요청
 * @param data - SignupData 타입의 회원가입 정보 객체
 * @returns - 성공 시 서버로부터 받은 응답 데이터
 */
export const postSignup = async (formData: FormData) => {
  const response = await api.post("/api/auth/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * 이메일 중복 확인 API 요청
 * @param email - 확인할 이메일 주소
 * @returns - { isDuplicate: boolean } 형식의 응답 데이터
 */
export const checkEmailExists = async (
  email: string
): Promise<{ isDuplicate: boolean }> => {
  const response = await api.get("/api/auth/email/exists", {
    params: { email },
  });
  return response.data;
};

/**
 * 아이디 중복 확인 API 요청
 * @param userId - 확인할 사용자 아이디
 * @returns - { isDuplicate: boolean } 형식의 응답 데이터
 */
export const checkUserIdExists = async (
  userId: string
): Promise<{ isDuplicate: boolean }> => {
  const response = await api.get("/api/auth/user-id/exists", {
    params: { userId },
  });
  return response.data;
};

// 로그인 요청 타입
export interface LoginRequest {
  email?: string
  userId?: string
  password: string
}

// 로그인 응답의 사용자 정보 타입
export interface User {
  email: string
  userId: string
  nickname: string
  role: 'ADMIN' | 'USER' | 'BANNED'
  artistList: number[]
  bannedTill?: string
  profileImg?: string
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const logIn = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const { email, userId, password } = credentials

    // ✅ 실제 백엔드 요청 (나중에 이 코드만 사용하시면 됩니다)
    /*
    const response = await api.post<LoginResponse>('/login/', credentials)
    const { accessToken, refreshToken, user } = response.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

    return response.data
    */

    // ✅ 현재는 백엔드 미연결 상태이므로 mock 처리
    const isCorrect =
      ((email === "test@example.com" || userId === "testuser") && password === "1234")

    if (!isCorrect) {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.")
    }

    const response = {
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          email: email || 'test@example.com',
          userId: userId || 'testuser',
          nickname: 'Mock User',
          role: 'USER' as 'USER',
          artistList: [1, 2, 3],
          bannedTill: undefined,
          profileImg: undefined
        }
      }
    }

    const { accessToken, refreshToken, user } = response.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

    console.log('Authorization 헤더 설정 완료:', api.defaults.headers.common['Authorization'])

    return response.data
  } catch (error) {
    console.error('로그인 실패:', error)
    throw error
  }
}
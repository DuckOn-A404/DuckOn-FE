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
  language: string
  imgUrl: string | null
  artistList: number[]
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
  
    const response = await api.post<LoginResponse>(
      "/api/auth/login",
      { email, userId, password }, // plain JSON
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // 응답에서 토큰과 사용자 정보 추출
    const { accessToken, refreshToken, user } = response.data;

    // 저장 및 Authorization 헤더 설정
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    console.log(" Authorization 헤더 설정 완료:", api.defaults.headers.common["Authorization"]);

    return response.data;
    
  } catch (error) {
    console.error('로그인 실패:', error)
    throw error
  }
}
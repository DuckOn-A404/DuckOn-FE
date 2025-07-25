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

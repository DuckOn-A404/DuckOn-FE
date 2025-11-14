import { api, buildRefreshHeaders } from "./axiosInstance";

type ApiMessage = { message: string };

/**
 * 회원가입 API 요청
 * @param data - SignupData 타입의 회원가입 정보 객체
 * @returns - 성공 시 서버로부터 받은 응답 데이터
 */
export const postSignup = async (formData: FormData) => {
  const response = await api.post("/auth/signup", formData, {
    skipAuth: true,
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
  const response = await api.get("/auth/email/exists", {
    skipAuth: true,
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
  const response = await api.get("/auth/user-id/exists", {
    skipAuth: true,
    params: { userId },
  });
  return response.data;
};

// 로그인 요청 타입
export interface LoginRequest {
  email?: string;
  userId?: string;
  password: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const logIn = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const { email, userId, password } = credentials;

    const response = await api.post<LoginResponse>(
      "/auth/login",
      { email, userId, password },
      {
        skipAuth: true,
        headers: { "Content-Type": "application/json" },
      }
    );

    // 응답에서 토큰 추출
    const { accessToken, refreshToken } = response.data;

    // 저장 및 Authorization 헤더 설정
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    // api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    return response.data;
  } catch (error) {
    console.error("로그인 실패:", error);
    throw error;
  }
};

/**
 * 소셜 로그인 직후 내 프로필 정보 가져오기
 * (헤더 기반이라면 인터셉터가 Authorization을 붙여줍니다)
 */
export const getMyProfileAfterOAuth = async () => {
  const response = await api.get("/me");
  return response.data;
};

/**
 * 로그아웃: POST /auth/logout
 * - 요청 헤더에 refresh 토큰을 Bearer로 전달
 * - 요청에서 skipAuth 제거 (요청 인터셉터 동작 가정)
 */

export const logoutUser = async (): Promise<ApiMessage> => {
  const res = await api.post<ApiMessage>(
    "/auth/logout",
    null,
    { headers: buildRefreshHeaders() }
  );
  return res.data;
};

/**
 * 이메일 인증번호 발송 API 요청
 * @param email - 인증번호를 받을 이메일 주소
 * @returns - { sent: boolean, message: string } 형식의 응답 데이터
 */
export const sendEmailVerificationCode = async (
  email: string
): Promise<{ sent: boolean; message: string }> => {
  const response = await api.post(
    "/auth/code",
    {
      email,
      emailPurpose: "SIGN_UP",
    },
    {
      skipAuth: true,
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

/**
 * 이메일 인증번호 검증 API 요청
 * @param email - 인증할 이메일 주소
 * @param code - 인증번호
 * @returns - { verified: boolean, message: string } 형식의 응답 데이터
 */
export const verifyEmailCode = async (
  email: string,
  code: string
): Promise<{ verified: boolean; message: string }> => {
  const response = await api.post(
    "/auth/verify",
    {
      email,
      code,
      emailPurpose: "SIGN_UP",
    },
    {
      skipAuth: true,
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};
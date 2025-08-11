// API 통신을 위한 설정 파일
import axios, { AxiosError, type AxiosRequestConfig } from "axios";

const RAW = import.meta.env.VITE_API_BASE_URL; // undefined | '' | '/api'
const API_BASE = RAW || "/api";

export const api = axios.create({
	baseURL: API_BASE,
	timeout: 5000,
	withCredentials: true,
});

// --- 유틸: 안전하게 토큰 꺼내기 ---
export const getAccessToken = (): string | null => {
	const raw = localStorage.getItem("accessToken");
	if (!raw) return null;
	const v = raw.trim();
	if (!v || v === "null" || v === "undefined") return null;
	return v;
};

export const getRefreshToken = (): string | null => {
	const raw =
		localStorage.getItem("refreshToken") ||
		sessionStorage.getItem("refreshToken");
	if (!raw) return null;
	const v = raw.trim();
	if (!v || v === "null" || v === "undefined") return null;
	return v;
};

// 리프레시 토큰 헤더 유틸
export const buildRefreshHeaders = (override?: string) => {
	const refresh = override ?? getRefreshToken();
	const h: Record<string, string> = {
		"Content-Type": "application/json"
	};
	if (refresh) h["Authorization"] = `Bearer ${refresh}`;
	return h;
};

// --- 토큰 갱신 이벤트 버스
type TokenListener = (token: string | null) => void;
const tokenListeners = new Set<TokenListener>();
export const onTokenRefreshed = (fn: TokenListener) => {
  tokenListeners.add(fn);
  return () => tokenListeners.delete(fn);
};
export const emitTokenRefreshed = (token: string | null) => {
  tokenListeners.forEach((fn) => fn(token));
};

// --- 옵션 확장: 공개 API는 토큰 건너뛰기 ---
declare module "axios" {
	// 호출할 때 { skipAuth: true } 주면 인터셉터가 Authorization을 건너뜀
	export interface AxiosRequestConfig {
		skipAuth?: boolean;
		_retry?: boolean;
	}
}

// --- 요청 인터셉터: 토큰 있을 때만 Authorization 추가 ---
api.interceptors.request.use((config) => {
	// headers 객체 보장
	config.headers = config.headers ?? {};

	if (config.skipAuth) {
		// 혹시 이전에 누가 넣었으면 제거
		delete (config.headers as any).Authorization;
		return config
		// if ("Authorization" in (config.headers as any)) {
		// 	delete (config.headers as any).Authorization;
		// }
		// return config;
	}

	const token = getAccessToken();
	if (token) {
		(config.headers as any).Authorization = `Bearer ${token}`;
	} else {
		// 없으면 절대 보내지 않기
		delete (config.headers as any).Authorization;
		// if ("Authorization" in (config.headers as any)) {
		// 	delete (config.headers as any).Authorization;
		// }
	}

	return config;
});


// ===== 응답 인터셉터 (401 → refresh → 재시도) =====
let isRefreshing = false;
let queue: {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
  config: AxiosRequestConfig;
}[] = [];

const flushQueue = (err: unknown, newToken: string | null) => {
  const q = [...queue];
  queue = [];
  q.forEach(({ resolve, reject, config }) => {
    if (err) return reject(err);
    if (newToken && config.headers) {
      (config.headers as any).Authorization = `Bearer ${newToken}`;
    }
    resolve(api(config));
  });
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = (error.config || {}) as AxiosRequestConfig;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if ((original as any)._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject, config: original });
      });
    }

    (original as any)._retry = true;
    isRefreshing = true;

    try {
      const refresh = getRefreshToken();
      if (!refresh) throw error;

      // 명세서: /auth/refresh 호출
      const resp = await axios.post(
        `/auth/refresh`,
        null,
        {
          headers: buildRefreshHeaders(refresh),
          withCredentials: true,
        }
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        (resp.data as any) ?? {};

      if (!newAccessToken) throw new Error("No accessToken in refresh response");

      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      emitTokenRefreshed(newAccessToken);

      if (original.headers) {
        (original.headers as any).Authorization = `Bearer ${newAccessToken}`;
      }

      flushQueue(null, newAccessToken);
      return api(original);
    } catch (e) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      emitTokenRefreshed(null);

      flushQueue(e, null);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
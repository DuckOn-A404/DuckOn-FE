// import axios, { AxiosError, type AxiosRequestConfig } from "axios";

// const RAW = import.meta.env.VITE_API_BASE_URL; // undefined | '' | '/api'
// export const API_BASE = RAW || "/api";

// export const api = axios.create({
//   baseURL: API_BASE,
//   timeout: 5000,
//   // withCredentials: true, // 헤더 기반이라도 true여도 무방(쿠키 안쓰면 영향 X)
//   withCredentials: false,
// });

// export const buildApiUrl = (path: string) => {
//   const p = path.startsWith("/") ? path : `/${path}`;
//   return `${API_BASE}${p}`;
// };

// // --- 유틸: 안전하게 토큰 꺼내기 ---
// export const getAccessToken = (): string | null => {
//   const raw = localStorage.getItem("accessToken");
//   if (!raw) return null;
//   const v = raw.trim();
//   if (!v || v === "null" || v === "undefined") return null;
//   return v;
// };

// export const getRefreshToken = (): string | null => {
//   const raw = localStorage.getItem("refreshToken");
//   if (!raw) return null;
//   const v = raw.trim();
//   if (!v || v === "null" || v === "undefined") return null;
//   return v;
// };

// // 리프레시 토큰 헤더 유틸
// export const buildRefreshHeaders = (override?: string) => {
//   const refresh = override ?? getRefreshToken();
//   const h: Record<string, string> = {
//     "Content-Type": "application/json",
//   };
//   if (refresh) h["Authorization"] = `Bearer ${refresh}`;
//   return h;
// };

// // --- 토큰 갱신 이벤트 버스
// type TokenListener = (token: string | null) => void;
// const tokenListeners = new Set<TokenListener>();
// export const onTokenRefreshed = (fn: TokenListener) => {
//   tokenListeners.add(fn);
//   return () => tokenListeners.delete(fn);
// };
// export const emitTokenRefreshed = (token: string | null) => {
//   tokenListeners.forEach((fn) => fn(token));
// };

// // --- 옵션 확장: 공개 API는 토큰 건너뛰기(옵션 유지, refresh엔 필요 없음) ---
// declare module "axios" {
//   export interface AxiosRequestConfig {
//     skipAuth?: boolean;
//     _retry?: boolean;
//   }
// }

// // --- 요청 인터셉터 ---
// // 규칙:
// // 1) 호출부가 이미 Authorization을 넣었으면(예: refresh/logout에 refresh 토큰) 절대 덮어쓰지 않음
// // 2) 그렇지 않고 skipAuth가 아니면 access 토큰을 자동 부착

// api.interceptors.request.use((config) => {
//   config.headers = config.headers ?? {};

//   const url = config.url ?? "";
//   const isAuthEndpoint = /\/auth\/(refresh|logout)$/.test(url);

//   if (isAuthEndpoint) {
//     // refresh/logout 은 호출부가 넣은 Authorization(= refresh)을 그대로 보냄
//     return config;
//   }

//   if (!config.skipAuth) {
//     const access = getAccessToken();
//     if (access) {
//       (config.headers as any).Authorization = `Bearer ${access}`; // 항상 최신 access로 세팅
//     } else {
//       delete (config.headers as any).Authorization;
//     }
//   }

//   return config;
// });

// // ===== 응답 인터셉터 (401 → refresh → 재시도) =====
// let isRefreshing = false;
// let queue: {
//   resolve: (v: unknown) => void;
//   reject: (e: unknown) => void;
//   config: AxiosRequestConfig;
// }[] = [];

// const flushQueue = (err: unknown, newToken: string | null) => {
//   const q = [...queue];
//   queue = [];
//   q.forEach(({ resolve, reject, config }) => {
//     if (err) return reject(err);
//     if (newToken && config.headers) {
//       (config.headers as any).Authorization = `Bearer ${newToken}`;
//     }
//     resolve(api(config));
//   });
// };

// api.interceptors.response.use(
//   (res) => res,
//   async (error: AxiosError) => {
//     const original = (error.config || {}) as AxiosRequestConfig;

//     // 401이 아니면 그대로
//     if (error.response?.status !== 401) {
//       return Promise.reject(error);
//     }

//     // refresh 요청 자체가 401이면 루프 방지: 바로 실패
//     const originalUrl = original.url || "";
//     if (originalUrl.includes("/auth/refresh")) {
//       return Promise.reject(error);
//     }

//     // 이미 재시도한 요청은 중복 방지
//     if ((original as any)._retry) {
//       return Promise.reject(error);
//     }

//     // 리프레시 중이면 큐에 대기
//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         queue.push({ resolve, reject, config: original });
//       });
//     }

//     (original as any)._retry = true;
//     isRefreshing = true;

//     try {
//       const refresh = getRefreshToken();
//       if (!refresh) throw error;

//       const resp = await api.post(
//         "/auth/refresh",
//         { refreshToken: refresh },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${refresh}`,
//             "X-Refresh-Token": refresh,
//           },
//           withCredentials: false,
//         }
//       );

//       const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
//         (resp.data as any) ?? {};

//       if (!newAccessToken)
//         throw new Error("No accessToken in refresh response");

//       localStorage.setItem("accessToken", newAccessToken);
//       if (newRefreshToken) {
//         localStorage.setItem("refreshToken", newRefreshToken);
//       }

//       emitTokenRefreshed(newAccessToken);

//       if (original.headers) {
//         (original.headers as any).Authorization = `Bearer ${newAccessToken}`;
//       }

//       flushQueue(null, newAccessToken);
//       return api(original);
//     } catch (e) {
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       emitTokenRefreshed(null);

//       flushQueue(e, null);
//       return Promise.reject(e);
//     } finally {
//       isRefreshing = false;
//     }
//   }
// );


// src/api/axiosInstance.ts
import axios, { AxiosError, type AxiosRequestConfig } from "axios";

const RAW = import.meta.env.VITE_API_BASE_URL; // undefined | '' | '/api'
export const API_BASE = RAW || "/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  withCredentials: false, // 헤더 기반 인증
});

export const buildApiUrl = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
};

// --- 유틸: 안전하게 토큰 꺼내기 ---
export const getAccessToken = (): string | null => {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return null;
  const v = raw.trim();
  if (!v || v === "null" || v === "undefined") return null;
  return v;
};

export const getRefreshToken = (): string | null => {
  const raw = localStorage.getItem("refreshToken");
  if (!raw) return null;
  const v = raw.trim();
  if (!v || v === "null" || v === "undefined") return null;
  return v;
};

// 리프레시 토큰 헤더 유틸
export const buildRefreshHeaders = (override?: string) => {
  const refresh = override ?? getRefreshToken();
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (refresh) h["Authorization"] = `Bearer ${refresh}`;
  return h;
};

// --- 토큰 갱신 이벤트 버스 ---
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
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}

// --- 요청 인터셉터 ---
// 1) /auth/refresh, /auth/logout 은 호출부가 넣은 Authorization(= refresh)을 그대로 보냄
// 2) 그 외는 skipAuth가 아니면 access 토큰을 자동 부착
api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  const url = config.url ?? "";
  const isAuthEndpoint = /\/auth\/(refresh|logout)$/.test(url);

  if (isAuthEndpoint) return config;

  if (!config.skipAuth) {
    const access = getAccessToken();
    if (access) {
      (config.headers as any).Authorization = `Bearer ${access}`;
    } else {
      delete (config.headers as any).Authorization;
    }
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
    const status = error.response?.status;

    // 401이 아니면 그대로
    if (status !== 401) {
      return Promise.reject(error);
    }

    // 🔒 [중요] 퀴즈 방(locked) 401은 refresh 시도 금지 → 호출부가 모달 띄움
    const url = (original.url || "") as string;
    const data = (error.response?.data ?? {}) as any;
    // ex) POST /rooms/275/enter
    if (/\/rooms\/\d+\/enter$/.test(url) || data?.locked === true) {
      return Promise.reject(error);
    }

    // refresh 요청 자체가 401이면 루프 방지
    if (url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // 이미 재시도한 요청은 중복 방지
    if ((original as any)._retry) {
      return Promise.reject(error);
    }

    // 리프레시 중이면 큐에 대기
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

      // 헤더/바디 모두 전송(백엔드 구현 차이 커버)
      const resp = await api.post(
        "/auth/refresh",
        { refreshToken: refresh },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refresh}`,
            "X-Refresh-Token": refresh,
          },
          withCredentials: false,
        }
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        (resp.data as any) ?? {};

      if (!newAccessToken) {
        throw new Error("No accessToken in refresh response");
      }

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

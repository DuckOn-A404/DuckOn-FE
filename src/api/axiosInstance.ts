// API 통신을 위한 설정 파일
import axios from "axios";

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

// --- 옵션 확장: 공개 API는 토큰 건너뛰기 ---
declare module "axios" {
	// 호출할 때 { skipAuth: true } 주면 인터셉터가 Authorization을 건너뜀
	export interface AxiosRequestConfig {
		skipAuth?: boolean;
	}
}

// --- 요청 인터셉터: 토큰 있을 때만 Authorization 추가 ---
api.interceptors.request.use((config) => {
	// headers 객체 보장
	config.headers = config.headers ?? {};

	if (config.skipAuth) {
		// 혹시 이전에 누가 넣었으면 제거
		if ("Authorization" in (config.headers as any)) {
			delete (config.headers as any).Authorization;
		}
		return config;
	}

	const token = getAccessToken();
	if (token) {
		(config.headers as any).Authorization = `Bearer ${token}`;
	} else {
		// 없으면 절대 보내지 않기
		if ("Authorization" in (config.headers as any)) {
			delete (config.headers as any).Authorization;
		}
	}

	return config;
});

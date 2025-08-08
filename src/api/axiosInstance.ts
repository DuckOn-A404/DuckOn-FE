// API 통신을 위한 설정 파일
import axios from "axios";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
	timeout: 5000,

	withCredentials: true,
});

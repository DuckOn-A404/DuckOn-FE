// API 통신을 위한 설정 파일
import axios from "axios";

const RAW = import.meta.env.VITE_API_BASE_URL; // undefined | '' | '/api'
const API_BASE = RAW || "/api"; // 빈문자열/undefined면 '/api'로 대체
export const api = axios.create({
	baseURL: API_BASE,
	timeout: 5000,

	withCredentials: true,
});

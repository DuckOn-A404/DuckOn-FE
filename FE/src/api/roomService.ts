// 방 생성 및 조회 API(POST /api/rooms 등)
import { api } from "./axiosInstance";

// 방 생성 API
export const CreateRoom = async (formData: FormData) => {
    const token = localStorage.getItem("accessToken")   // 개별 요청에서만 토큰 꺼내기
    const response = await api.post("/api/rooms", formData, {
        headers: {
            // "Content-Type": "multipart/form-data",
            ...(token && { Authorization: `Bearer ${token}` })  // 조건부로 헤더 추가
        },
    })
    return response.data
}

// 방 정보 조회 API
export const fetchRoomById = async (roomId: string) => {
    const token = localStorage.getItem("accessToken")
    const response = await api.get(`/api/rooms/${roomId}`, {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    })
    return response.data
}
// 방 생성 및 조회 API(POST /api/rooms 등)
import { api } from "./axiosInstance";

// 방 생성 API
export const CreateRoom = async (formData: FormData) => {
    const response = await api.post("/api/rooms", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    return response.data
}
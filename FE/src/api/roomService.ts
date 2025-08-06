import { api } from "./axiosInstance";
import type { room } from "../types/room";

// 방 생성 API
export const CreateRoom = async (formData: FormData) => {
  const token = localStorage.getItem("accessToken"); // 개별 요청에서만 토큰 꺼내기
  const response = await api.post("/api/rooms", formData, {
    headers: {
      // "Content-Type": "multipart/form-data",
      ...(token && { Authorization: `Bearer ${token}` }), // 조건부로 헤더 추가
    },
  });
  return response.data;
};

// 방 정보 조회 API
export const fetchRoomById = async (roomId: string) => {
  const token = localStorage.getItem("accessToken");
  const response = await api.get(`/api/rooms/${roomId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return response.data;
};

/**
 * 특정 아티스트의 방 목록을 가져오는 API 함수
 * @param artistId - 조회할 아티스트의 ID
 * @returns 방 목록 배열
 */
export const getRoomsByArtist = async (artistId: number): Promise<room[]> => {
  // 지금 로그인 상태에서만 리스트가 불러와지네,,,,
  const token = localStorage.getItem("accessToken");

  const response = await api.get(`/api/rooms`, {
    params: {
      artistId,
    },
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return response.data.roomInfoList;
};

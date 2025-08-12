import { api, getAccessToken } from "./axiosInstance";
import type { room } from "../types/Room";

// 방 생성 API
export const CreateRoom = async (formData: FormData) => {
  const response = await api.post("/rooms", formData);
  return response.data;
};

// 방 정보 조회 API -> 일단 비로그인 사용자도 입장 가능하게 수정
export const fetchRoomById = async (roomId: string) => {
  const response = await api.get(`/rooms/${roomId}`, { skipAuth: true });
  return response.data;
};

/**
 * 특정 아티스트의 방 목록을 가져오는 API 함수
 * @param artistId - 조회할 아티스트의 ID
 * @returns 방 목록 배열
 */
export const getRoomsByArtist = async (artistId: number): Promise<room[]> => {
  const response = await api.get(`/rooms`, {
    params: {
      artistId,
    },
    skipAuth: true,
  });

  return response.data.roomInfoList;
};

/**
 * 트렌딩 방 목록을 가져오는 API 함수
 * @param size - 조회할 방의 개수 (기본값: 3)
 * @returns 트렌딩 방 목록 배열
 */
export const getTrendingRooms = async (size = 3): Promise<room[]> => {
  try {
    const response = await api.get("/rooms/trending", {
      params: { size },
    });
    return response.data.roomInfoList || [];
  } catch {
    return [];
  }
};

// 방 입장(entryAnswer)
export const enterRoom = async (roomId: string, answer: string) => {
  const hasAccess = !!getAccessToken();
  const res = await api.post(
    `/rooms/${roomId}/enter`,
    { entryAnswer: answer ?? "" },
    {
      headers: { "Content-Type": "application/json" },
      skipAuth: !hasAccess, // 토큰 없으면 Authorization 안보냄 → Spring 필터 401 방지
    }
  );
  return res.data;
};

// 방 퇴장
export const exitRoom = async (roomId: number, artistId: number) => {
  const res = await api.post(`/rooms/${roomId}/exit`, null, { params: { artistId } });
  return res.data;
};

// 방 삭제
export const deleteRoom = async (roomId: number, artistId: number) => {
  const res = await api.delete(`/rooms/${roomId}`, { params: { artistId } });
  return res.data;
};

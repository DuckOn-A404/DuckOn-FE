import { api, getAccessToken } from "./axiosInstance";
import type { room, TrendingRoomsResponse } from "../types/Room";

// 방 생성 API
export const CreateRoom = async (formData: FormData) => {
  const response = await api.post("/rooms", formData);
  return response.data;
};

// 방 정보 조회 API (공개)
export const fetchRoomById = async (roomId: string) => {
  const response = await api.get(`/rooms/${roomId}`, { skipAuth: true });
  return response.data;
};

/** 특정 아티스트의 방 목록 */
export const getRoomsByArtist = async (artistId: number): Promise<room[]> => {
  const response = await api.get(`/rooms`, {
    params: { artistId },
    skipAuth: true,
  });
  return response.data.roomInfoList;
};

/** 트렌딩 방 목록 */
export const getTrendingRooms = async (
  page: number,
  size = 10
): Promise<TrendingRoomsResponse> => {
  const response = await api.get("/rooms/trending", {
    params: { page, size },
    skipAuth: true,
  });
  return response.data;
};

/** 방 입장 (질문/locked 대응) */
export const enterRoom = async (roomId: string, answer: string) => {
  const access = getAccessToken();
  const res = await api.post(
    `/rooms/${roomId}/enter`,
    { entryAnswer: answer ?? "" },
    {
      headers: { "Content-Type": "application/json" },
      // 토큰이 있으면 Authorization 자동부착, 없으면 완전 공개 호출
      skipAuth: !access,
    }
  );
  return res.data;
};

/** 방 퇴장 */
export const exitRoom = async (roomId: number, artistId: number) => {
  const res = await api.post(`/rooms/${roomId}/exit`, null, {
    params: { artistId },
  });
  return res.data;
};

/** 방 삭제 */
export const deleteRoom = async (roomId: number, artistId: number) => {
  const res = await api.delete(`/rooms/${roomId}`, { params: { artistId } });
  return res.data;
};

/** 방 제목 변경 */
export const updateRoomTitle = async (
  roomId: number | string,
  title: string
) : Promise<string> => {
  const { data } = await api.patch<string>(
    `/rooms/${roomId}/title`,
    null,
    { params: { title } }
  );
  return data
}


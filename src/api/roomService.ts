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
// export const enterRoom = async (roomId: string, answer: string) => {
//   const res = await api.post(`/rooms/${roomId}/enter`,
//     { entryAnswer: answer ?? ""},
//     { headers: { "Content-Type": "application/json" } }
//   );
//   return res.data
  // try {
  //   const response = await api.post(`/rooms/${roomId}/enter`, {
  //     entryAnswer: String(entryAnswer),
  //   });
  //   return response.data;
  // } catch (error: any) {
  //   console.error("방 입장 실패:", error?.response?.data || error);
  //   throw error;
  // }
// };

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
// 2차 수정
// export const exitRoom = async (roomId: number, artistId: number): Promise<string> => {
//   const token = localStorage.getItem("accessToken");
//   if (!roomId) throw new Error("roomId가 없습니다.");
//   if (!artistId || Number.isNaN(artistId) || artistId <= 0) {
//     throw new Error("artistId가 유효하지 않습니다.");
//   }

//   try {
//     const res = await api.post(`/rooms/${roomId}/exit`, null, {
//       params: { artistId },
//       headers: {
//         ...(token && { Authorization: `Bearer ${token}` }),
//         Accept: "text/plain",
//       },
//     });
//     // 서버: "방에서 퇴장하였습니다."
//     return typeof res.data === "string" ? res.data : String(res.data?.message ?? "");
//   } catch (err: any) {
//     throw new Error(err?.response?.data || "방 퇴장에 실패했습니다.");
//   }
// };


// 방 삭제
// 2차 수정
export const deleteRoom = async (roomId: number, artistId: number) => {
  const res = await api.delete(`/rooms/${roomId}`, { params: { artistId } });
  return res.data;
};
// export const deleteRoom = async (roomId: number, artistId: number): Promise<string> => {
//   const token = localStorage.getItem("accessToken");
//   if (!roomId) throw new Error("roomId가 없습니다.");
//   if (!artistId || Number.isNaN(artistId) || artistId <= 0) {
//     throw new Error("artistId가 유효하지 않습니다.");
//   }

//   try {
//     const res = await api.delete(`/rooms/${roomId}`, {
//       params: { artistId },
//       headers: {
//         ...(token && { Authorization: `Bearer ${token}` }),
//         Accept: "text/plain",
//       },
//     });
//     // 서버: "방이 삭제되었습니다."
//     return typeof res.data === "string" ? res.data : String(res.data?.message ?? "");
//   } catch (err: any) {
//     throw new Error(err?.response?.data || "방 삭제에 실패했습니다.");
//   }
// };
import {api} from "./axiosInstance";
import type {room} from "../types/Room";

// 방 생성 API
export const CreateRoom = async (formData: FormData) => {
	const token = localStorage.getItem("accessToken"); // 개별 요청에서만 토큰 꺼내기
	const response = await api.post("/rooms", formData, {
		headers: {
			...(token && {Authorization: `Bearer ${token}`}), // 조건부로 헤더 추가
		},
	});
	return response.data;
};

// 방 정보 조회 API
export const fetchRoomById = async (roomId: string) => {
	const token = localStorage.getItem("accessToken");
	const response = await api.get(`/rooms/${roomId}`, {
		headers: {
			...(token && {Authorization: `Bearer ${token}`}),
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

	const response = await api.get(`/rooms`, {
		params: {
			artistId,
		},
		headers: {
			...(token && {Authorization: `Bearer ${token}`}),
		},
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
			params: {size},
		});
		// 백엔드 응답 구조에 따라 `response.data.roomInfoList` 등으로 변경될 수 있습니다.
		// 만약 응답 데이터가 바로 배열이라면 `response.data`를 사용합니다.
		return response.data.roomInfoList || [];
	} catch (error) {
		console.error("트렌딩 방 목록을 불러오는 데 실패했습니다:", error);
		return [];
	}
};

// 방 입장(entryAnswer)
export const enterRoom = async (roomId: string, entryAnswer: string) => {
	const token = localStorage.getItem("accessToken");

	try {
		const response = await api.post(
			`/rooms/${roomId}/enter`,
			{entryAnswer: String(entryAnswer)},
			{
				headers: {
					...(token && {Authorization: `Bearer ${token}`}),
				},
			}
		);
		return response.data;
	} catch (error: any) {
		console.error("방 입장 실패:", error?.response?.data || error);
		throw error;
	}
};

import { api } from "./axiosInstance";
import { dummyRooms } from "../mocks/rooms";

/**
 * 아티스트 목록 조회 API 요청
 * @param page - 조회할 페이지 번호 (기본값: 1)
 * @param size - 페이지당 아티스트 수 (기본값: 6)
 * @returns - 성공 시 서버로부터 받은 아티스트 목록 데이터
 */
export const getArtistList = async (page = 1, size = 12) => {
  const token = localStorage.getItem("accessToken"); // 저장 방식에 따라 수정 가능

  const response = await api.get("/api/artists", {
    params: { page, size },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("[디버그] 전체 조회 응답:", response.data);

  const artistList = response.data?.artistList ?? [];
  const total = response.data?.totalElements ?? 0;

  return {
    data: artistList,
    total,
    page: response.data.page,
    size: response.data.size,
  };
};

/**
 * 아티스트 검색 API 요청
 * @param keyword - 검색어
 * @returns - 성공 시 서버로부터 받은 아티스트 검색 결과 데이터
 */
export const searchArtists = async (keyword: string) => {
  const token = localStorage.getItem("accessToken");

  const response = await api.get("/api/artists", {
    params: { keyword },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("[디버그] 검색 응답:", response.data);

  return response.data.artistList ?? [];
};

/**
 * 단일 아티스트 상세 정보 API 요청
 * @param artistId - 조회할 아티스트 ID
 * @returns 아티스트 정보 + 로그인 유저의 팔로우 여부
 */
export const getArtistDetail = async (artistId: number) => {
  const token = localStorage.getItem("accessToken");

  const response = await api.get(`/api/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

/**
 * 아티스트 팔로우 요청
 * @param artistId - 팔로우할 아티스트 ID
 */
export const followArtist = async (artistId: number) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await api.post(`/api/artists/${artistId}/follow`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

/**
 * 아티스트 언팔로우 요청
 * @param artistId - 언팔로우할 아티스트 ID
 * 아 근데 이거는 delete 최대한 없애기로 했으니까 나중에 수정해야할듯
 */
export const unfollowArtist = async (artistId: number) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await api.delete(`/api/artists/${artistId}/follow`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * 로그인한 사용자가 팔로우한 아티스트 목록 조회
 * @param page - 조회할 페이지 번호 (기본값: 1)
 * @param size - 페이지당 항목 수 (기본값: 10)
 * @returns 아티스트 목록과 페이징 정보
 */
export const getFollowedArtists = async (page = 1, size = 10) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await api.get("/api/artists/me", {
    params: { page, size },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

/**
 * 특정 아티스트의 방송 목록을 조회하는 API 함수 (현재는 더미 데이터로 시뮬레이션)
 * @param {number} artistId - 조회할 아티스트의 ID
 * @param {number} [page=1] - 조회할 페이지 번호
 * @param {number} [size=4] - 페이지당 방 개수
 * @param {'live' | 'upcoming' | 'all'} [status='all'] - 조회할 방의 상태 ('live', 'upcoming', 'all')
 * @returns {Promise<object>} 방 목록과 페이지네이션 정보를 담은 객체
 */
export const getArtistRooms = async (
  artistId: number,
  page = 1,
  size = 4,
  status: "live" | "upcoming" | "all" = "all"
) => {
  console.log(
    `[API 시뮬레이션] artistId: ${artistId}, page: ${page}, size: ${size}, status: ${status}`
  );

  // 1. artistId로 필터링
  const artistRooms = dummyRooms.filter((room) => room.artistId === artistId);

  // 2. status로 필터링
  const statusFiltered =
    status === "all"
      ? artistRooms
      : artistRooms.filter((room) =>
          status === "live" ? room.isLive : !room.isLive
        );

  // 3. 페이지네이션 계산
  const totalElements = statusFiltered.length;
  const totalPages = Math.ceil(totalElements / size);
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;

  // 4. 현재 페이지에 해당하는 데이터만 잘라내기
  const roomList = statusFiltered.slice(startIndex, endIndex);

  // 5. 실제 API처럼 0.5초 딜레이 추가
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 6. 실제 API와 동일한 형태로 응답 객체 반환
  return {
    roomList,
    page,
    size,
    totalElements,
    totalPages,
  };
};

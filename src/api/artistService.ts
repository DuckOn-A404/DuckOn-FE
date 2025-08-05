import { api } from "./axiosInstance";

/**
 * 아티스트 목록 조회 API 요청
 * @param page - 조회할 페이지 번호 (기본값: 1)
 * @param size - 페이지당 아티스트 수 (기본값: 6)
 * @returns - 성공 시 서버로부터 받은 아티스트 목록 데이터
 */
export const getArtistList = async (page = 1, size = 12) => {
  const token = localStorage.getItem("accessToken");

  const response = await api.get("/api/artists", {
    params: { page, size },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
 * 랜덤 아티스트 목록 조회 API 요청
 * @param size - 조회할 아티스트 수
 * @returns - 성공 시 서버로부터 받은 아티스트 목록 배열
 */
export const getRandomArtists = async (size = 4) => {
  const response = await api.get("/api/artists/random", {
    params: { size },
  });

  return response.data.artistList;
};

import { api } from "./axiosInstance";
import { dummyArtists } from "../mocks/artists";

/**
 * 아티스트 목록 조회 API 요청
 * @param page - 조회할 페이지 번호 (기본값: 1)
 * @param size - 페이지당 아티스트 수 (기본값: 6)
 * @returns - 성공 시 서버로부터 받은 아티스트 목록 데이터
 */
export const getArtistList = async (page = 1, size = 10) => {
  const response = await api.get("/api/artists/all", {
    params: { page, size },
  });
  console.log("[디버그] 전체 조회 응답:", response.data);

  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;

  // 테스트용
  const slicedData = dummyArtists.slice(startIndex, endIndex);
  await new Promise((resolve) => setTimeout(resolve, 200));

  // 테스트용 리턴
  return {
    data: slicedData,
    total: dummyArtists.length,
    page,
    size,
  };
  // 실제 api 통신시 사용
  // return {
  //   data: response.data.artistList,
  //   total: response.data.totalElements,
  //   page: response.data.page,
  //   size: response.data.size,
  // };
};

/**
 * 아티스트 검색 API 요청
 * @param keyword - 검색어
 * @returns - 성공 시 서버로부터 받은 아티스트 검색 결과 데이터
 */
export const searchArtists = async (keyword: string) => {
  const response = await api.get("/api/artists", {
    params: { keyword },
  });
  return response.data.artistList;
};

/**
 * 단일 아티스트 상세 정보 API 요청
 * @param artistId - 조회할 아티스트 ID
 * @returns 아티스트 정보 + 로그인 유저의 팔로우 여부
 */
export const getArtistDetail = async (artistId: number) => {
  const response = await api.get(`/api/artists/${artistId}`);
  return response.data;
};

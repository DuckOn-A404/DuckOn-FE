import { api, getAccessToken } from "./axiosInstance";
import type { Artist } from "../types/artist";

export type SortKey = "followers" | "name" | "debut";
export type SortOrder = "asc" | "desc";

type GetArtistListOpts = {
  page?: number;
  size?: number;
  sort?: SortKey;
  order?: SortOrder;
  keyword?: string; // 검색어
};

/** BE가 내려주는 아티스트 상세 응답 형태(추정 필드 포함) */
export type ArtistDetailInfo = {
  artistId: number;
  nameEn: string;
  nameKr: string;
  debutDate: string;          // ISO date string
  imgUrl: string | null;
  followedAt?: string | null; // 로그인 상태에서만 내려올 수 있음
  isFollowed?: boolean;       // 선택적(참고용)
  followerCount?: number;     // 선택적(참고용)
};

export type SimpleMessage = { message: string };

export type PagedArtists = {
  artistList: Artist[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  // 레거시 alias(기존 코드 보호)
  data: Artist[];
  total: number;
};

/**
 * 아티스트 목록 조회 (페이지네이션 + 정렬 + 검색)
 *
 * - 백엔드 `/api/artists` 하나로 처리합니다.
 * - `keyword`가 있으면 백엔드가 검색 핸들러(`/artists?keyword=`)로 라우팅되어
 *   `{ artistList }`만 내려올 수 있습니다. 이 경우 `totalPages=1`로 보정합니다.
 *
 * @overload
 * @param page 조회할 페이지(1-base)
 * @param size 페이지 당 개수
 * @returns 페이징/검색 결과
 *
 * @overload
 * @param opts 옵션 객체({ page, size, sort, order, keyword })
 * @returns 페이징/검색 결과
 *
 * @example
 * // 1) 기존 방식(숫자 인자)
 * const res = await getArtistList(1, 30);
 * console.log(res.artistList, res.totalElements);
 *
 * @example
 * // 2) 확장 방식(옵션 객체)
 * const res = await getArtistList({ page: 1, size: 40, sort: "followers", order: "desc", keyword: "NewJeans" });
 * console.log(res.artistList, res.totalPages);
 */
export function getArtistList(page?: number, size?: number): Promise<PagedArtists>;
export function getArtistList(opts: GetArtistListOpts): Promise<PagedArtists>;

// 실제 구현 (오버로드 통합)
export async function getArtistList(
  arg1?: number | GetArtistListOpts,
  arg2?: number
): Promise<PagedArtists> {
  // 기존 시그니처(page, size) 또는 옵션 객체 지원
  let page = 1;
  let size = 12;
  let sort: SortKey | undefined;
  let order: SortOrder | undefined;
  let keyword: string | undefined;

  if (typeof arg1 === "object") {
    page = arg1.page ?? 1;
    size = arg1.size ?? 30; // 한 번에 더 크게 가져와 스크롤 끊김 완화
    sort = arg1.sort;
    order = arg1.order;
    keyword = arg1.keyword?.trim() || undefined;
  } else {
    page = arg1 ?? 1;
    size = arg2 ?? 12;
  }

  const params: Record<string, string | number> = { page, size };
  if (sort) params.sort = sort;
  if (order) params.order = order;
  if (keyword) params.keyword = keyword; // /artists?keyword= 핸들러 매칭

  const response = await api.get("/artists", {
    params,
    skipAuth: true, // 공개 API: 토큰 미전송
  });

  const data = response.data || {};
  const artistList: Artist[] = data.artistList ?? [];
  const pageResp = data.page ?? page;
  const sizeResp = data.size ?? size;
  const totalPages = data.totalPages ?? 1;
  const totalElements = data.totalElements ?? artistList.length;

  return {
    artistList,
    page: pageResp,
    size: sizeResp,
    totalPages,
    totalElements,
    data: artistList,     // legacy alias
    total: totalElements, // legacy alias
  };
}

/**
 * 아티스트 검색 (직접 사용 비권장)
 *
 * NOTE: 현재 페이지에서는 `getArtistList({ keyword })`로 대체합니다.
 * 다른 페이지에서 기존 로직을 유지할 필요가 있을 때만 사용하세요.
 *
 * @param keyword 검색어
 * @returns 검색 결과 리스트(페이지네이션 없음)
 */
export const searchArtists = async (keyword: string): Promise<Artist[]> => {
  const response = await api.get("/artists", {
    params: { keyword },
    skipAuth: true,
  });
  return (response.data.artistList ?? []) as Artist[];
};

/**
 * 단일 아티스트 상세 정보 조회
 * @param artistId 조회할 아티스트 ID
 * @returns 아티스트 상세 + 로그인 유저의 팔로우 여부
 */
export const getArtistDetail = async (artistId: number): Promise<ArtistDetailInfo> => {
  const res = await api.get(`/artists/${artistId}`, { skipAuth: true });
  return res.data as ArtistDetailInfo;
};

/**
 * 아티스트 팔로우
 * @throws Error 로그인 필요 시
 * @param artistId 팔로우할 아티스트 ID
 */
export const followArtist = async (artistId: number): Promise<SimpleMessage> => {
  if (!getAccessToken()) throw new Error("로그인이 필요합니다.");
  const res = await api.post(`/artists/${artistId}/follow`);
  return res.data as SimpleMessage;
};

/**
 * 아티스트 언팔로우
 * @throws Error 로그인 필요 시
 * @param artistId 언팔로우할 아티스트 ID
 */
export const unfollowArtist = async (artistId: number): Promise<SimpleMessage> => {
  if (!getAccessToken()) throw new Error("로그인이 필요합니다.");
  const res = await api.delete(`/artists/${artistId}/follow`);
  return res.data as SimpleMessage;
};

/**
 * 내가 팔로우한 아티스트 목록(마이 페이지 등)
 * @param page 1-base 페이지
 * @param size 페이지 크기
 * @returns 페이징 결과
 */
export type FollowedArtistsResponse = {
  artistList: Artist[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
};

export const getFollowedArtists = async (
  page = 1,
  size = 10
): Promise<FollowedArtistsResponse> => {
  if (!getAccessToken()) throw new Error("로그인이 필요합니다.");
  const res = await api.get("/artists/me", { params: { page, size } });
  return res.data as FollowedArtistsResponse;
};

/**
 * 랜덤 아티스트 조회(홈 추천 등)
 * @param size 개수
 * @returns 아티스트 배열
 */
export const getRandomArtists = async (size = 5): Promise<Artist[]> => {
  const res = await api.get("/artists/random", {
    params: { size },
    skipAuth: true,
  });
  return res.data.artistList as Artist[];
};

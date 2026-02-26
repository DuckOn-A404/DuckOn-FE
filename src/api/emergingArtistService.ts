import { api, getAccessToken } from "./axiosInstance";

export interface SimpleMessage {
  status: number;
  message: string;
  data: string;
}

export interface EmergingArtistDetailResponse {
  status: number;
  message: string;
  data: {
    emergingArtistId: number;
    createdAt: string;
    debutDate: string;
    nameKr: string;
    nameEn: string;
    imgUrl: string;
    status: string;
    createdByUserNickName: string;
    followerCount: number;
    following: boolean;
  };
}

export interface EmergingArtistDetail {
  emergingArtistId: number;
  createdAt: string;
  debutDate: string;
  nameKr: string;
  nameEn: string;
  imgUrl: string;
  status: string;
  createdByUserNickName: string;
  followerCount: number;
  following: boolean;
}

export const getEmergingArtistDetail = async (
  emergingArtistId: number
): Promise<EmergingArtistDetail> => {
  const response = await api.get<EmergingArtistDetailResponse>(
    `/emerging-artists/${emergingArtistId}`
  );

  return response.data.data;
};

/**
 * 내가 팔로우한 라이징 아티스트 목록 조회
 * @param page 1-base 페이지
 * @param size 페이지 크기
 * @returns 페이징 결과
 */
export interface FollowedEmergingArtistsResponse {
  items: EmergingArtistDetail[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export const getFollowedEmergingArtists = async (
  page = 1,
  size = 10
): Promise<FollowedEmergingArtistsResponse> => {
  if (!getAccessToken()) throw new Error("로그인이 필요합니다.");
  const res = await api.get("/me/emerging-artists", { params: { page, size } });
  return res.data.data as FollowedEmergingArtistsResponse;
};
/**
 * 라이징 아티스트 팔로우
 * @param emergingArtistId 팔로우할 라이징 아티스트 ID
 * @throws Error 로그인 필요 시
 */
export const followEmergingArtist = async (
  emergingArtistId: number
): Promise<SimpleMessage> => {
  if (!getAccessToken()) throw new Error("로그인이 필요합니다.");
  const res = await api.post(`/emerging-artists/${emergingArtistId}/follow`);
  return res.data as SimpleMessage;
};

/**
 * 라이징 아티스트 언팔로우
 * @param emergingArtistId 언팔로우할 라이징 아티스트 ID
 * @throws Error 로그인 필요 시
 */
export const unfollowEmergingArtist = async (
  emergingArtistId: number
): Promise<SimpleMessage> => {
  if (!getAccessToken()) throw new Error("로그인이 필요합니다.");
  const res = await api.delete(`/emerging-artists/${emergingArtistId}/follow`);
  return res.data as SimpleMessage;
};

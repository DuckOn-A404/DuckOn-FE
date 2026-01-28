import { api } from "./axiosInstance";
import type { Artist } from "../types/artist";

export interface EmergingArtistItem {
  emergingArtistId: number;
  createdAt: string;
  debutDate: string;
  nameKr: string;
  nameEn: string;
  imgUrl: string;
  status: string;
  followerCount: number;
}

export interface GetEmergingArtistsResponse {
  status: number;
  message: string;
  data: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: EmergingArtistItem[];
  };
}

export type RisingArtistListResponse = {
  artistList: Artist[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
};

export const getRisingArtistList = async (params: {
  page?: number;
  size?: number;
  sort?: string;
  order?: string;
  keyword?: string;
}): Promise<RisingArtistListResponse> => {
  const response = await api.get<GetEmergingArtistsResponse>("/emerging-artists", {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 20,
      sort: params.sort ?? "followers",
      order: params.order ?? "desc",
      keyword: params.keyword,
    },
    skipAuth: true,
  });

  const apiData = response.data?.data;
  
  // API 응답의 items를 Artist 타입으로 변환
  const artistList: Artist[] = (apiData?.items ?? []).map((item) => ({
    artistId: item.emergingArtistId,
    nameEn: item.nameEn,
    nameKr: item.nameKr,
    debutDate: item.debutDate,
    imgUrl: item.imgUrl,
  }));

  return {
    artistList,
    page: apiData?.page ?? params.page ?? 1,
    size: apiData?.size ?? params.size ?? 20,
    totalPages: apiData?.totalPages ?? 1,
    totalElements: apiData?.totalElements ?? 0,
  };
};

export interface AddRisingArtistRequest {
  nameKr: string;
  nameEn: string;
  debutDate: string;
  imgUrl: string;
}

export interface AddRisingArtistResponse {
  status: number;
  message: string;
  data: {
    emergingArtistId: number;
  };
}

export const addRisingArtist = async (
  requestData: AddRisingArtistRequest
): Promise<AddRisingArtistResponse> => {
  const response = await api.post("/emerging-artists", requestData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getRandomRisingArtists = async (size = 5): Promise<Artist[]> => {
  const res = await api.get("/rising-artists/random", {
    params: { size },
  });
  return res.data.artistList as Artist[];
};

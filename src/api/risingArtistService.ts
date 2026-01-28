import { api } from "./axiosInstance";
import type { Artist } from "../types/artist";

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
  const response = await api.get("/rising-artists", {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 30,
      sort: params.sort,
      order: params.order,
      keyword: params.keyword,
    },
    skipAuth: true,
  });

  const data = response.data || {};
  return {
    artistList: data.artistList ?? [],
    page: data.page ?? params.page ?? 1,
    size: data.size ?? params.size ?? 30,
    totalPages: data.totalPages ?? 1,
    totalElements: data.totalElements ?? 0,
  };
};

export const addRisingArtist = async (formData: FormData): Promise<{ message: string; artistId: number }> => {
  const response = await api.post("/rising-artists", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
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

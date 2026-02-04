import { api } from "./axiosInstance";

export interface ArtistChangeRequestCreateRequest {
  targetType: "ARTIST" | "EMERGING_ARTIST";
  targetId: number;
  content: string;
  attachment?: string;
}

export interface ArtistChangeRequestCreateResponse {
  status: number;
  message: string;
  data: string;
}

export const createArtistChangeRequest = async (
  requestData: ArtistChangeRequestCreateRequest
): Promise<ArtistChangeRequestCreateResponse> => {
  const response = await api.post("/artist-change-requests", requestData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export interface ArtistChangeRequestItem {
  id: number;
  targetType: "ARTIST" | "EMERGING_ARTIST";
  targetId: number;
  artistNameEn: string;
  artistNameKr: string;
  content: string;
  attachment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface ArtistChangeRequestListResponse {
  status: number;
  message: string;
  data: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: ArtistChangeRequestItem[];
  };
}

export const getMyArtistChangeRequests = async (params: {
  page?: number;
  size?: number;
}): Promise<ArtistChangeRequestListResponse> => {
  const response = await api.get("/artist-change-requests/me", {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 10,
    },
  });
  return response.data;
};

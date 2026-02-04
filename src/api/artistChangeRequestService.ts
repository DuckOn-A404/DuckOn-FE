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

import { api } from "./axiosInstance";

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
}

export const getEmergingArtistDetail = async (
  emergingArtistId: number
): Promise<EmergingArtistDetail> => {
  const response = await api.get<EmergingArtistDetailResponse>(
    `/emerging-artists/${emergingArtistId}`,
    {
      skipAuth: true,
    }
  );

  return response.data.data;
};

import { api } from "./axiosInstance";

export const getArtistList = async (page = 1, size = 20) => {
  const response = await api.get("/api/artist", {
    params: { page, size },
  });
  return response.data;
};

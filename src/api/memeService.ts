// src/api/memeService.ts
import { api } from "./axiosInstance";

export type Meme = {
  id: number;
  imageUrl: string;
  tags?: string[];
  favorite?: boolean;
};

// 인기(top10) 가져오기
export const fetchTopMemes = async (): Promise<Meme[]> => {
  // /api/memes/top/total
  const res = await api.get("/memes/top/total");
  const items = res.data?.data?.items ?? [];

  return items.map((it: any) => ({
    id: it.memeId,
    imageUrl: it.memeUrl,
    tags: it.tags,
  }));
};

// 즐겨찾기 목록 (배열 그대로 오는 버전)
export const fetchFavoriteMemes = async (): Promise<Meme[]> => {
  const res = await api.get("/memes/favorites");
  const raw = res.data?.data;
  if (!Array.isArray(raw)) return [];
  // 필요하면 여기서 slice(0, 10) 해도 됨
  return raw.slice(0, 10).map((it: any) => ({
    id: it.memeId,
    imageUrl: it.memeUrl,
    tags: it.tags,
    favorite: true,
  }));
};

// 검색은 일단 top 기준이 없으니까 예전 random 방식 그대로 두거나
// BE에 검색 엔드포인트 생기면 교체하면 됨
export const searchMemes = async (q: string): Promise<Meme[]> => {
  const res = await api.get("/memes/top/total", {
    params: { q }, // BE가 q 안 받으면 이 줄은 빼
  });
  const items = res.data?.data?.items ?? [];
  return items.map((it: any) => ({
    id: it.memeId,
    imageUrl: it.memeUrl,
    tags: it.tags,
  }));
};

export const toggleFavoriteMeme = async (memeId: number): Promise<void> => {
  await api.post(`/memes/${memeId}/favorite`);
};

export const logMemeUsage = async (
  memeId: number,
  usageType: "USE" | "DOWNLOAD" = "USE"
): Promise<void> => {
  await api.post("/memes/usage", { memeId, usageType });
};

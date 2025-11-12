import { api } from "./axiosInstance";

export type Meme = {
  id: number;
  imageUrl: string;
  tags?: string[];
  favorite?: boolean;
};

export type MemeResponse = {
  items: Meme[];
  total: number;
  page: number;
  size: number;
};

// 인기(top10) 가져오기 - 페이지네이션 지원
export const fetchTopMemes = async (page: number = 1, size: number = 30): Promise<MemeResponse> => {
  // /api/memes/top/total
  const res = await api.get("/memes/top/total", {
    params: { page, size }
  });
  const data = res.data?.data;
  const items = data?.items ?? [];

  return {
    items: items.map((it: any) => ({
      id: it.memeId,
      imageUrl: it.memeUrl,
      tags: it.tags,
    })),
    total: data?.total ?? 0,
    page: data?.page ?? page,
    size: data?.size ?? size,
  };
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

// 태그 기반 밈 검색 API - 페이지네이션 지원
export const searchMemes = async (q: string, page: number = 1, size: number = 30): Promise<MemeResponse> => {
  const res = await api.get("/memes/search-basic", {
    params: { 
      tag: q,
      page,
      size
    },
  });
  const data = res.data?.data;
  const items = data?.items ?? [];
  
  return {
    items: items.map((it: any) => ({
      id: it.memeId,
      imageUrl: it.memeUrl,
      tags: it.tags,
    })),
    total: data?.total ?? 0,
    page: data?.page ?? page,
    size: data?.size ?? size,
  };
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

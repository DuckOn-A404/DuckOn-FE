import { api } from "./axiosInstance";

export type Meme = {
  id: number;
  imageUrl: string;
  favorite?: boolean;
};

export type MemeResponse = {
  items: Meme[];
  total: number;
  page: number;
  size: number;
};

// 랜덤 밈 가져오기 - 페이지네이션 지원
export const fetchRandomMemes = async (page: number = 1, size: number = 30): Promise<MemeResponse> => {
  const res = await api.get("/memes/random", {
    params: { page, size }
  });
  const data = res.data?.data;
  const items = data?.items ?? [];

  return {
    items: items.map((it: any) => ({
      id: it.memeId,
      imageUrl: it.memeUrl,
    })),
    total: data?.total ?? 0,
    page: data?.page ?? page,
    size: data?.size ?? size,
  };
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

// 즐겨찾기 목록 조회 (페이지네이션 지원)
export const fetchFavoriteMemes = async (page: number = 1, size: number = 10): Promise<MemeResponse> => {
  const res = await api.get("/me/favorite-memes", {
    params: { page, size }
  });
  const data = res.data?.data;
  const items = data?.items ?? [];

  return {
    items: items.map((it: any) => ({
      id: it.memeId,
      imageUrl: it.memeUrl,
      favorite: true,
    })),
    total: data?.total ?? 0,
    page: data?.page ?? page,
    size: data?.size ?? size,
  };
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
    })),
    total: data?.total ?? 0,
    page: data?.page ?? page,
    size: data?.size ?? size,
  };
};

// 즐겨찾기 추가
export const addFavoriteMeme = async (memeId: number): Promise<void> => {
  await api.post(`/memes/${memeId}/favorite`);
};

// 즐겨찾기 취소
export const removeFavoriteMeme = async (memeId: number): Promise<void> => {
  await api.delete(`/memes/${memeId}/favorite`);
};

// 즐겨찾기 토글 (기존 함수 유지 - deprecated, addFavoriteMeme 사용 권장)
export const toggleFavoriteMeme = async (memeId: number): Promise<void> => {
  await api.post(`/memes/${memeId}/favorite`);
};

export const logMemeUsage = async (
  memeId: number,
  usageType: "USE" | "DOWNLOAD" = "USE"
): Promise<void> => {
  await api.post("/memes/usage", { memeId, usageType });
};

// 태그 검색 키워드 로그 기록
export const logSearchKeyword = async (keyword: string): Promise<void> => {
  await api.post("/tags/search/log", { keyword });
};

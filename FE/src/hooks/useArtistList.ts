import { useState, useEffect } from "react";
import { type Artist } from "../types/artist";
import { getArtistList, searchArtists } from "../api/artistService";

export const useArtistList = (searchText: string) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // 아티스트 목록 전체 불러오는 훅
  const fetchMore = async () => {
    if (loading || !hasMore || searchText.trim() !== "") return;
    setLoading(true);

    try {
      const res = await getArtistList(page);
      const newData = res.data;

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setArtists((prev) => {
          const existingIds = new Set(prev.map((a) => a.artistId));
          const newArtists = res.data.filter(
            (a) => !existingIds.has(a.artistId)
          );
          return [...prev, ...newArtists];
        });
        setPage((prev) => prev + 1);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error("아티스트 로딩 실패", err);
    } finally {
      setLoading(false);
    }
  };

  // 검색 또는 전체 초기 로딩
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        if (searchText.trim() !== "") {
          const result = await searchArtists(searchText);
          setArtists(result);
          setTotalCount(result.length);
          setHasMore(false);
        } else {
          const res = await getArtistList(1);
          setArtists(res.data);
          setPage(2);
          setTotalCount(res.total);
          setHasMore(res.data.length > 0);
        }
      } catch (err) {
        console.error("검색 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [searchText]);

  return {
    artists,
    totalCount,
    fetchMore,
    loading,
    hasMore,
  };
};

import { useState, useEffect } from "react";
import { type Artist } from "../types/artist";
import { getArtistList, searchArtists } from "../api/artistService";

/* useArtistList : 아티스트 목록 조회 및 검색을 관리하는 커스텀 훅
  1. 아티스트 목록 상태 관리 (데이터, 총 개수, 로딩 상태, 다음 페이지 여부)
  2. 검색어(searchText) 유무에 따라 전체 목록 조회 또는 검색 기능 수행
  3. 무한 스크롤을 위한 '더 불러오기'(fetchMore) 기능 제공
  4. 검색어 변경 시 자동으로 새로운 검색 실행
*/
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
          const existingIds = new Set(prev.map((a: Artist) => a.artistId));
          const newArtists = res.data.filter(
            (a: Artist) => !existingIds.has(a.artistId)
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

import { useState, useEffect } from "react";
import { getTrendingRooms } from "../api/roomService";
import type { TrendingRoomsResponse } from "../types/Room";

/**
 * 트렌딩 방 목록 데이터를 관리하는 커스텀 훅
 * @param page - 조회할 페이지 번호 (기본값: 1)
 * @param size - 페이지당 방 수 (기본값: 10)
 */
export const useTrendingRooms = (page: number, size: number) => {
  const [data, setData] = useState<TrendingRoomsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try{
        const result = await getTrendingRooms(page, size);
        if(!cancelled) {
          setData(result);
        }
      } catch {
        if(!cancelled) {
          setError("방 목록을 불러오는 데 실패했습니다.");
        }
      } finally {
        if(!cancelled) setIsLoading(false);
      }
    }) ();
    return () => {
      cancelled = true; // 컴포넌트 언마운트 시 요청 취소
    };
  }, [page, size]);

  return { data, isLoading, error };
};

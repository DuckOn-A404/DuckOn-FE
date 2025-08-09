import { useState, useEffect } from "react";
import { getTrendingRooms } from "../api/roomService";
import type { room } from "../types/Room";

/**
 * 트렌딩 방 목록 데이터를 관리하는 커스텀 훅
 * @param size - 불러올 방의 개수
 */
export const useTrendingRooms = (size: number) => {
  const [trendingRooms, setTrendingRooms] = useState<room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTrendingRooms(size);
        setTrendingRooms(data);
      } catch {
        setError("트렌딩 방 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [size]);

  return { trendingRooms, isLoading, error };
};
